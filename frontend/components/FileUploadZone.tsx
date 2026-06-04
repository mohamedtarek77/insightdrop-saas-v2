"use client";

import { useCallback, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileUploadZone({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTheme();

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFileChange(dropped);
    },
    [onFileChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileChange(f);
  };

  if (file) {
    return (
      <div
        className="rounded-[18px] p-5 flex items-center justify-between mb-4 theme-transition"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--accent)", borderStyle: "solid" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-light)" }}
          >
            <FileText size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{file.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {(file.size / 1024).toFixed(0)} KB · {t("Ready to analyze", "جاهز للتحليل")}
            </p>
          </div>
        </div>
        <button
          onClick={() => onFileChange(null)}
          className="transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--rose)")}
          onMouseOut={(e)  => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          <X size={16} />
        </button>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="rounded-[18px] p-14 flex flex-col items-center justify-center gap-4 text-center cursor-pointer mb-4 theme-transition group"
      style={{
        background: "var(--bg-surface)",
        border: "1.5px dashed var(--border-mid)",
        transition: "all 0.18s ease, background var(--t-med), border-color var(--t-med)",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLElement).style.background  = "var(--accent-light)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)";
        (e.currentTarget as HTMLElement).style.background  = "var(--bg-surface)";
      }}
    >
      <div
        className="w-13 h-13 rounded-[14px] flex items-center justify-center"
        style={{ background: "var(--bg-raised)", width: 52, height: 52 }}
      >
        <Upload size={20} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("Drop your file here, or ", "أسقط ملفك هنا، أو ")}
          <span className="font-medium" style={{ color: "var(--accent)" }}>{t("browse", "تصفح")}</span>
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
          {t("CSV, XLSX, XLS · Max 50 MB", "CSV, XLSX, XLS · الحجم الأقصى 50 ميجابايت")}
        </p>
      </div>
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleChange} />
    </div>
  );
}
