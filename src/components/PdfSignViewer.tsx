"use client";

import { Box } from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef } from "react";

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = "/worker/pdf.worker.min.mjs";

type Props = {
  base64: string;
  onSelectPoint: (p: { page: number; pdfX: number; pdfY: number }) => void;
};

export default function PdfSignViewer({ base64, onSelectPoint }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!base64) return;
    renderPdf();
  }, [base64]);

  async function renderPdf() {
    const container = containerRef.current!;
    container.innerHTML = ""; // clear cũ

    const pdfData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      canvas.style.display = "block";
      canvas.style.margin = "0 auto 16px";
      canvas.style.cursor = "crosshair";

      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 🔥 CHUẨN pdf.js
        const [pdfX, pdfY] = viewport.convertToPdfPoint(x, y);

        onSelectPoint({
          page: pageNumber,
          pdfX,
          pdfY,
        });
      };

      container.appendChild(canvas);
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: "auto",
        height: "80vh",
        background: "#f5f5f5",
        p: 2,
      }}
    />
  );
}
