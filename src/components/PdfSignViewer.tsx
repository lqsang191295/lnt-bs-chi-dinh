"use client";

import { Box } from "@mui/material";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuid } from "uuid";
import DraggableSignature from "./DraggableSignature";

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

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: "auto",
        height: "100vh",
        background: "#f5f5f5",
        position: "relative",
      }}>
      {/* Sử dụng Portal để gắn Signature vào đúng thẻ div của trang đó */}
      {signatures.map((sig) => {
        const pageEl = pageRefs.current.get(sig.page);
        if (!pageEl) return null;

        return createPortal(
          <DraggableSignature
            key={sig.id}
            sig={sig}
            onUpdatePos={updateSigPos}
            onDelete={deleteSig}
          />,
          pageEl
        );
      })}
    </Box>
  );
}
