"use client";

import { useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function FileUploadZone({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-acid/10 flex items-center justify-center">
            <FileSpreadsheet size={20} className="text-acid" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-100">{file.name}</p>
            <p className="text-xs text-ink-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
        <button
          onClick={() => onFileChange(null)}
          className="text-ink-400 hover:text-coral transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "glass rounded-2xl border-2 border-dashed border-white/10 p-12",
        "flex flex-col items-center justify-center gap-4 cursor-pointer",
        "hover:border-acid/40 hover:bg-acid/3 transition-all group"
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-acid/10 transition-colors">
        <Upload size={24} className="text-ink-400 group-hover:text-acid transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-ink-200">
          Drop your file here, or{" "}
          <span className="text-acid">browse</span>
        </p>
        <p className="text-xs text-ink-500 mt-1">CSV, XLSX, XLS · Max 50 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
