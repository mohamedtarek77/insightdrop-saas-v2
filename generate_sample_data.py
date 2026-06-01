"""
Generate a realistic sample sales CSV for testing InsightDrop.
Run: python generate_sample_data.py
Output: sample_sales_data.csv  (500 rows)
"""

import csv
import random
from datetime import date, timedelta

PRODUCTS = [
    ("Wireless Mouse", "Electronics", 29.99, 12.00),
    ("Mechanical Keyboard", "Electronics", 89.99, 38.00),
    ("USB-C Hub", "Electronics", 39.99, 15.00),
    ("Monitor Stand", "Furniture", 49.99, 20.00),
    ("Standing Desk", "Furniture", 349.00, 180.00),
    ("Ergonomic Chair", "Furniture", 299.00, 145.00),
    ("Notebook A5", "Stationery", 8.99, 2.50),
    ("Ballpoint Pens (12pk)", "Stationery", 6.99, 1.80),
    ("Desk Organizer", "Stationery", 19.99, 7.00),
    ("Webcam HD", "Electronics", 69.99, 28.00),
    ("LED Desk Lamp", "Lighting", 34.99, 14.00),
    ("Smart Bulb Pack", "Lighting", 24.99, 9.00),
    ("Whey Protein 1kg", "Health", 44.99, 18.00),
    ("Yoga Mat", "Health", 29.99, 11.00),
    ("Water Bottle 1L", "Health", 14.99, 5.00),
]

REGIONS = ["North", "South", "East", "West", "Central"]

start_date = date(2024, 1, 1)
rows = []

for i in range(1, 501):
    product_name, category, price, cost = random.choice(PRODUCTS)
    quantity = random.randint(1, 10)
    order_date = start_date + timedelta(days=random.randint(0, 364))
    region = random.choice(REGIONS)
    rows.append({
        "order_id": f"ORD-{i:04d}",
        "product_name": product_name,
        "category": category,
        "quantity": quantity,
        "price": price,
        "cost": cost,
        "order_date": order_date.strftime("%Y-%m-%d"),
        "region": region,
    })

with open("sample_sales_data.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Generated sample_sales_data.csv with {len(rows)} rows")
