"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackupDownloadButton() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/v1/admin/backup", { credentials: "include" });
      if (!res.ok) {
        let message = "Backup failed";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          /* ignore */
        }
        alert(message);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      const date = new Date().toISOString().slice(0, 10);
      const filename = match?.[1] ?? `backup-${date}.json`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup download failed:", error);
      alert("Backup download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      variant="outline"
      className="flex items-center gap-2 border-[#1a2d4a] bg-[#0f1e38] text-[#94a3b8] hover:border-[#4f6ef7] hover:text-white"
    >
      <Download className="w-4 h-4" />
      {downloading ? "Downloading…" : "Download Backup"}
    </Button>
  );
}
