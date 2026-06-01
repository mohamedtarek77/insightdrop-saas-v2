"""
ETL Pipeline – entirely in-memory, zero persistence.

run_pipeline()       → analytics dict only  (used by /analyze)
run_pipeline_full()  → (analytics dict, cleaned DataFrame)  (used by /export)
"""

from __future__ import annotations

import gc
import logging
from io import BytesIO
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

REQUIRED_COLUMNS = {
    "order_id", "product_name", "category",
    "quantity", "price", "cost", "order_date", "region",
}

COLUMN_ALIASES: dict[str, str] = {
    "orderid": "order_id", "order id": "order_id",
    "productname": "product_name", "product name": "product_name", "product": "product_name",
    "qty": "quantity",
    "unit_price": "price", "unit price": "price",
    "unit_cost": "cost",  "unit cost": "cost",
    "date": "order_date", "sale_date": "order_date", "sale date": "order_date",
}


def run_pipeline(file_buffer: BytesIO, filename: str) -> dict[str, Any]:
    analytics, df = _run(file_buffer, filename)
    del df
    gc.collect()
    return analytics


def run_pipeline_full(file_buffer: BytesIO, filename: str) -> tuple[dict[str, Any], pd.DataFrame]:
    return _run(file_buffer, filename)


def _run(file_buffer: BytesIO, filename: str) -> tuple[dict[str, Any], pd.DataFrame]:
    ext = filename.rsplit(".", 1)[-1].lower()
    df = _ingest(file_buffer, ext)
    logger.info("Ingested %d rows x %d cols", *df.shape)
    df = _validate_and_normalise(df)
    df = _clean(df)
    logger.info("After cleaning: %d rows", len(df))
    df = _engineer(df)
    analytics = _aggregate(df)
    return analytics, df


def _ingest(buf: BytesIO, ext: str) -> pd.DataFrame:
    if ext == "csv":
        try:
            df = pd.read_csv(buf, encoding="utf-8")
        except UnicodeDecodeError:
            buf.seek(0)
            df = pd.read_csv(buf, encoding="latin-1")
    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(buf, engine="openpyxl" if ext == "xlsx" else "xlrd")
    else:
        raise ValueError(f"Unsupported file extension: .{ext}")
    if df.empty:
        raise ValueError("The uploaded file contains no data.")
    return df


def _validate_and_normalise(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = (
        df.columns.str.strip().str.lower()
        .str.replace(r"\s+", "_", regex=True)
        .str.replace(r"[^\w]", "", regex=True)
    )
    df = df.rename(columns=COLUMN_ALIASES)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(sorted(missing))}. "
            f"File has: {', '.join(sorted(df.columns))}."
        )
    return df


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df[list(REQUIRED_COLUMNS)].copy()
    df.drop_duplicates(inplace=True)
    for col in ("quantity", "price", "cost"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df.dropna(subset=["quantity", "price", "cost"], inplace=True)
    df = df[(df["quantity"] > 0) & (df["price"] > 0)]
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    df.dropna(subset=["order_date"], inplace=True)
    for col in ("product_name", "category", "region"):
        df[col] = df[col].fillna("Unknown").str.strip()
    df.reset_index(drop=True, inplace=True)
    return df


def _engineer(df: pd.DataFrame) -> pd.DataFrame:
    df["revenue"]     = df["quantity"] * df["price"]
    df["profit"]      = df["revenue"] - (df["quantity"] * df["cost"])
    df["order_month"] = df["order_date"].dt.to_period("M").astype(str)
    df["order_year"]  = df["order_date"].dt.year
    return df


def _aggregate(df: pd.DataFrame) -> dict[str, Any]:
    total_revenue   = float(df["revenue"].sum())
    total_profit    = float(df["profit"].sum())
    total_orders    = int(len(df))
    avg_order_value = float(total_revenue / total_orders) if total_orders else 0.0
    profit_margin   = (total_profit / total_revenue * 100) if total_revenue else 0.0

    monthly = (
        df.groupby("order_month")
        .agg(revenue=("revenue","sum"), orders=("order_id","count"))
        .reset_index().sort_values("order_month")
    )
    monthly_sales = [
        {"month": r.order_month, "revenue": round(r.revenue,2), "orders": int(r.orders)}
        for r in monthly.itertuples()
    ]

    top_products = (
        df.groupby("product_name")
        .agg(revenue=("revenue","sum"), quantity=("quantity","sum"))
        .nlargest(10,"revenue").reset_index()
    )
    top_products_list = [
        {"product": r.product_name, "revenue": round(r.revenue,2), "quantity": int(r.quantity)}
        for r in top_products.itertuples()
    ]

    region_sales = (
        df.groupby("region")
        .agg(revenue=("revenue","sum"), orders=("order_id","count"))
        .reset_index().sort_values("revenue", ascending=False)
    )
    region_list = [
        {"region": r.region, "revenue": round(r.revenue,2), "orders": int(r.orders)}
        for r in region_sales.itertuples()
    ]

    category_sales = (
        df.groupby("category")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"), orders=("order_id","count"))
        .reset_index().sort_values("revenue", ascending=False)
    )
    category_list = [
        {"category": r.category, "revenue": round(r.revenue,2),
         "profit": round(r.profit,2), "orders": int(r.orders)}
        for r in category_sales.itertuples()
    ]

    return {
        "kpis": {
            "total_revenue":     round(total_revenue, 2),
            "total_profit":      round(total_profit, 2),
            "total_orders":      total_orders,
            "avg_order_value":   round(avg_order_value, 2),
            "profit_margin_pct": round(profit_margin, 2),
        },
        "charts": {
            "monthly_sales":  monthly_sales,
            "top_products":   top_products_list,
            "region_sales":   region_list,
            "category_sales": category_list,
        },
        "meta": {
            "rows_processed": total_orders,
            "date_range": {
                "start": df["order_date"].min().strftime("%Y-%m-%d"),
                "end":   df["order_date"].max().strftime("%Y-%m-%d"),
            },
        },
    }
