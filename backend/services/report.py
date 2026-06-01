"""
PDF Report Generator – produces a professional multi-page analytics report
using ReportLab (Platypus).  Everything is built in-memory; nothing is written
to disk.
"""

from __future__ import annotations

import io
from datetime import datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ── Palette ───────────────────────────────────────────────────────────────────
INK       = colors.HexColor("#0D0D0F")
INK_500   = colors.HexColor("#3C3C52")
INK_300   = colors.HexColor("#9494A0")
INK_100   = colors.HexColor("#E8E8EC")
ACID      = colors.HexColor("#C8FA64")
ACID_DARK = colors.HexColor("#6B9900")   # readable on white for text
SKY       = colors.HexColor("#64C8FA")
SKY_DARK  = colors.HexColor("#0077AA")
CORAL     = colors.HexColor("#FF6B6B")
CORAL_DARK= colors.HexColor("#CC2200")
WHITE     = colors.white
LIGHT_BG  = colors.HexColor("#F5F5F7")
ROW_ALT   = colors.HexColor("#F0F0F4")


def _fmt_currency(v: float) -> str:
    if v >= 1_000_000:
        return f"${v/1_000_000:.1f}M"
    if v >= 1_000:
        return f"${v/1_000:.1f}K"
    return f"${v:.2f}"


def _fmt_num(v: int | float) -> str:
    return f"{int(v):,}"


# ── Style definitions ─────────────────────────────────────────────────────────
def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", fontName="Helvetica-Bold", fontSize=26,
            textColor=INK, spaceAfter=4, alignment=TA_LEFT,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", fontName="Helvetica", fontSize=11,
            textColor=INK_300, spaceAfter=2, alignment=TA_LEFT,
        ),
        "section": ParagraphStyle(
            "section", fontName="Helvetica-Bold", fontSize=13,
            textColor=INK, spaceBefore=14, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body", fontName="Helvetica", fontSize=10,
            textColor=INK_500, leading=15,
        ),
        "kpi_label": ParagraphStyle(
            "kpi_label", fontName="Helvetica", fontSize=9,
            textColor=INK_300, alignment=TA_CENTER,
        ),
        "kpi_value": ParagraphStyle(
            "kpi_value", fontName="Helvetica-Bold", fontSize=20,
            textColor=INK, alignment=TA_CENTER,
        ),
        "kpi_sub": ParagraphStyle(
            "kpi_sub", fontName="Helvetica", fontSize=8,
            textColor=INK_300, alignment=TA_CENTER,
        ),
        "footer": ParagraphStyle(
            "footer", fontName="Helvetica", fontSize=8,
            textColor=INK_300, alignment=TA_CENTER,
        ),
        "th": ParagraphStyle(
            "th", fontName="Helvetica-Bold", fontSize=9,
            textColor=WHITE, alignment=TA_CENTER,
        ),
        "td": ParagraphStyle(
            "td", fontName="Helvetica", fontSize=9,
            textColor=INK, alignment=TA_CENTER,
        ),
        "td_left": ParagraphStyle(
            "td_left", fontName="Helvetica", fontSize=9,
            textColor=INK, alignment=TA_LEFT,
        ),
    }


# ── KPI row builder ───────────────────────────────────────────────────────────
def _kpi_table(kpis: dict[str, Any], s: dict) -> Table:
    items = [
        ("Total Revenue",    _fmt_currency(kpis["total_revenue"]),   ""),
        ("Total Profit",     _fmt_currency(kpis["total_profit"]),     f"{kpis['profit_margin_pct']}% margin"),
        ("Total Orders",     _fmt_num(kpis["total_orders"]),          ""),
        ("Avg Order Value",  _fmt_currency(kpis["avg_order_value"]),  ""),
    ]
    cells = []
    for label, value, sub in items:
        cell = [
            Paragraph(label, s["kpi_label"]),
            Paragraph(value, s["kpi_value"]),
            Paragraph(sub or " ", s["kpi_sub"]),
        ]
        cells.append(cell)

    tbl = Table([cells], colWidths=[40 * mm] * 4)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_BG]),
        ("BOX",        (0, 0), (0, 0),  0.5, ACID_DARK),
        ("BOX",        (1, 0), (1, 0),  0.5, SKY_DARK),
        ("BOX",        (2, 0), (2, 0),  0.5, CORAL_DARK),
        ("BOX",        (3, 0), (3, 0),  0.5, ACID_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LINEABOVE",     (0, 0), (0, 0),  2, ACID_DARK),
        ("LINEABOVE",     (1, 0), (1, 0),  2, SKY_DARK),
        ("LINEABOVE",     (2, 0), (2, 0),  2, CORAL_DARK),
        ("LINEABOVE",     (3, 0), (3, 0),  2, ACID_DARK),
    ]))
    return tbl


# ── Generic data table ────────────────────────────────────────────────────────
def _data_table(headers: list[str], rows: list[list], s: dict, col_widths=None) -> Table:
    th_row = [Paragraph(h, s["th"]) for h in headers]
    data = [th_row]
    for i, row in enumerate(rows):
        style = s["td_left"] if i == 0 else s["td"]
        cells = []
        for j, cell in enumerate(row):
            st = s["td_left"] if j == 0 else s["td"]
            cells.append(Paragraph(str(cell), st))
        data.append(cells)

    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    n = len(rows)
    row_bg = [(ROW_ALT if i % 2 == 0 else WHITE) for i in range(n)]

    style_cmds = [
        ("BACKGROUND",    (0, 0), (-1, 0),  INK),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0),  9),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",          (0, 0), (-1, -1), 0.3, INK_100),
    ]
    for i, bg in enumerate(row_bg, start=1):
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))

    tbl.setStyle(TableStyle(style_cmds))
    return tbl


# ── Public entry point ────────────────────────────────────────────────────────
def generate_pdf_report(analytics: dict[str, Any]) -> bytes:
    """
    Build a PDF analytics report from the analytics dict returned by the ETL
    pipeline.  Returns raw PDF bytes – caller is responsible for streaming.
    """
    buf = io.BytesIO()
    s = _styles()
    W, H = A4
    margin = 18 * mm

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=margin, rightMargin=margin,
        topMargin=margin,  bottomMargin=margin + 6 * mm,
        title="InsightDrop Sales Report",
        author="InsightDrop",
    )

    kpis   = analytics["kpis"]
    charts = analytics["charts"]
    meta   = analytics["meta"]
    story  = []

    # ── Cover / Header ────────────────────────────────────────────────────
    generated_at = datetime.utcnow().strftime("%B %d, %Y  %H:%M UTC")
    story.append(Paragraph("InsightDrop", ParagraphStyle(
        "brand", fontName="Helvetica-Bold", fontSize=13, textColor=ACID_DARK)))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Sales Analytics Report", s["title"]))
    story.append(Paragraph(
        f"Period: {meta['date_range']['start']}  →  {meta['date_range']['end']}  ·  "
        f"{_fmt_num(meta['rows_processed'])} transactions  ·  Generated {generated_at}",
        s["subtitle"],
    ))
    story.append(Spacer(1, 3 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=INK_100))
    story.append(Spacer(1, 5 * mm))

    # ── KPI Summary ───────────────────────────────────────────────────────
    story.append(Paragraph("Key Performance Indicators", s["section"]))
    story.append(_kpi_table(kpis, s))
    story.append(Spacer(1, 6 * mm))

    # ── Monthly Sales ─────────────────────────────────────────────────────
    story.append(Paragraph("Monthly Revenue Breakdown", s["section"]))
    monthly = charts["monthly_sales"]
    # usable width = A4 width - left margin - right margin
    UW = W - 2 * margin   # ~173 mm

    m_headers = ["Month", "Revenue", "Orders", "Avg / Order"]
    m_rows = [
        [
            row["month"],
            _fmt_currency(row["revenue"]),
            _fmt_num(row["orders"]),
            _fmt_currency(row["revenue"] / row["orders"]) if row["orders"] else "$0",
        ]
        for row in monthly
    ]
    cw = [UW * 0.28, UW * 0.26, UW * 0.22, UW * 0.24]
    story.append(_data_table(m_headers, m_rows, s, col_widths=cw))
    story.append(Spacer(1, 6 * mm))

    # ── Top Products ──────────────────────────────────────────────────────
    story.append(Paragraph("Top 10 Products by Revenue", s["section"]))
    prod_headers = ["#", "Product", "Revenue", "Units Sold"]
    prod_rows = [
        [i + 1, row["product"], _fmt_currency(row["revenue"]), _fmt_num(row["quantity"])]
        for i, row in enumerate(charts["top_products"])
    ]
    pw = [UW * 0.06, UW * 0.46, UW * 0.26, UW * 0.22]
    story.append(_data_table(prod_headers, prod_rows, s, col_widths=pw))
    story.append(Spacer(1, 6 * mm))

    # ── Region Performance ────────────────────────────────────────────────
    story.append(Paragraph("Sales by Region", s["section"]))
    reg_headers = ["Region", "Revenue", "Orders", "Share %"]
    total_rev = kpis["total_revenue"] or 1
    reg_rows = [
        [
            row["region"],
            _fmt_currency(row["revenue"]),
            _fmt_num(row["orders"]),
            f"{row['revenue'] / total_rev * 100:.1f}%",
        ]
        for row in charts["region_sales"]
    ]
    rw = [UW * 0.30, UW * 0.26, UW * 0.22, UW * 0.22]
    story.append(_data_table(reg_headers, reg_rows, s, col_widths=rw))
    story.append(Spacer(1, 6 * mm))

    # ── Category Performance ──────────────────────────────────────────────
    story.append(Paragraph("Category Performance", s["section"]))
    cat_headers = ["Category", "Revenue", "Profit", "Margin %", "Orders"]
    cat_rows = [
        [
            row["category"],
            _fmt_currency(row["revenue"]),
            _fmt_currency(row["profit"]),
            f"{row['profit'] / row['revenue'] * 100:.1f}%" if row["revenue"] else "0%",
            _fmt_num(row["orders"]),
        ]
        for row in charts["category_sales"]
    ]
    catw = [UW * 0.28, UW * 0.20, UW * 0.18, UW * 0.16, UW * 0.18]
    story.append(_data_table(cat_headers, cat_rows, s, col_widths=catw))
    story.append(Spacer(1, 8 * mm))

    # ── Footer note ───────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=INK_100))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        "This report was generated by InsightDrop. "
        "No sales data was stored during processing. "
        "All figures are derived from the uploaded file only.",
        s["footer"],
    ))

    doc.build(story)
    buf.seek(0)
    return buf.read()
