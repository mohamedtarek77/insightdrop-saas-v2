const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface AnalyticsResponse {
  kpis: {
    total_revenue: number;
    total_profit: number;
    total_orders: number;
    avg_order_value: number;
    profit_margin_pct: number;
  };
  charts: {
    monthly_sales: { month: string; revenue: number; orders: number }[];
    top_products: { product: string; revenue: number; quantity: number }[];
    region_sales: { region: string; revenue: number; orders: number }[];
    category_sales: {
      category: string;   
      revenue: number;
      profit: number;
      orders: number;
    }[];
  };
  meta: {
    rows_processed: number;
    date_range: { start: string; end: string };
  };
}

export async function downloadExport(
  file: File,
  accessToken: string,
  format: "pdf" | "excel"
): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/export/${format}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Export failed" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? (format === "pdf" ? "report.pdf" : "data.xlsx");
  return { blob, filename };
}

export async function analyzeFile(
  file: File,
  accessToken: string
): Promise<AnalyticsResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/analyze/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }

  return response.json();
}
