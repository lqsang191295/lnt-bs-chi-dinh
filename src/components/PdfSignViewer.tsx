"use client";

import { Box, Button } from "@mui/material";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import DraggableSignature, {
  DraggableSignatureRef,
} from "./DraggableSignature";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/worker/pdf.worker.min.mjs";

interface SignatureItem {
  id: string;
  page: number;
  x: number;
  y: number;
}

export default function PdfSignViewer({ base64 }: { base64: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [pagesRendered, setPagesRendered] = useState<number[]>([]);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const sigComponentRefs = useRef<Map<string, DraggableSignatureRef>>(
    new Map()
  );

  useEffect(() => {
    if (!base64) return;
    renderIdRef.current++;
    renderPdf(renderIdRef.current);
  }, [base64]);

  async function renderPdf(renderId: number) {
    const container = containerRef.current!;
    container.innerHTML = "";
    pageRefs.current.clear();
    setPagesRendered([]);

    const pdfData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (renderId !== renderIdRef.current) return;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const pageWrapper = document.createElement("div");
      pageWrapper.className = "pdf-page-wrapper";
      pageWrapper.style.position = "relative";
      pageWrapper.style.width = `${viewport.width}px`;
      pageWrapper.style.margin = "16px auto";
      pageWrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = "block";
      canvas.style.cursor = "crosshair";

      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSignatures((prev) => [
          ...prev,
          { id: uuid(), page: pageNumber, x, y },
        ]);
      };

      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);

      pageRefs.current.set(pageNumber, pageWrapper);
      setPagesRendered((prev) => [...prev, pageNumber]);
    }
  }

  const updateSigPos = (id: string, x: number, y: number) => {
    setSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  };

  const deleteSig = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!base64) return;

    debugger;

    // 1. Load PDF gốc
    const existingPdfBytes = Uint8Array.from(atob(base64), (c) =>
      c.charCodeAt(0)
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // 2. Lặp qua các chữ ký để vẽ
    for (const sig of signatures) {
      const pageIndex = sig.page - 1;
      const pdfPage = pages[pageIndex];
      const { width, height } = pdfPage.getSize();

      // Lấy canvas hiện tại từ ref
      const sigRef = sigComponentRefs.current.get(sig.id);
      if (!sigRef) continue;

      const canvas = sigRef.getCanvas();
      if (!canvas) continue;

      // Chuyển canvas thành ảnh để chèn vào PDF
      const pngImageBytes = await fetch(canvas.toDataURL()).then((res) =>
        res.arrayBuffer()
      );
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      // QUAN TRỌNG: Tính toán tọa độ
      // Tọa độ PDF bắt đầu từ GÓC DƯỚI BÊN TRÁI (0,0)
      // Tọa độ Web bắt đầu từ GÓC TRÊN BÊN TRÁI
      // Scale: 1.5 là scale khi render PDF.js
      const scale = 1.5;
      const sigWidth = canvas.width / scale;
      const sigHeight = canvas.height / scale;

      // Chuyển đổi tọa độ từ Web sang PDF
      const pdfX = sig.x / scale - sigWidth / 2;
      const pdfY = height - sig.y / scale - sigHeight / 2;

      pdfPage.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: sigWidth,
        height: sigHeight,
      });
    }

    // 3. Xuất file base64
    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });
    console.log("File đã ký (Base64):", pdfBase64);

    // Tải về máy (Tùy chọn)
    const link = document.createElement("a");
    link.href = pdfBase64;
    link.download = "signed_document.pdf";
    link.click();
  };

  return (
    <Box className="h-full flex flex-col overflow-hidden">
      <Box sx={{ p: 2, background: "#fff", borderBottom: "1px solid #ddd" }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save & Download PDF
        </Button>
      </Box>
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#f5f5f5",
          position: "relative",
        }}>
        {signatures.map((sig) => (
          <DraggableSignature
            key={sig.id}
            ref={(el) => {
              if (el) sigComponentRefs.current.set(sig.id, el);
              else sigComponentRefs.current.delete(sig.id);
            }}
            sig={sig}
            onUpdatePos={updateSigPos}
            onDelete={deleteSig}
          />
        ))}
      </Box>
    </Box>
  );
}
