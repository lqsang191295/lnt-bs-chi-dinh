"use client";

import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { Box, Button, Typography } from "@mui/material";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuid } from "uuid";
import DraggableSignature, {
  DraggableSignatureRef,
} from "./DraggableSignature";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/worker/pdf.worker.min.js";

interface SignatureItem {
  id: string;
  page: number;
  x: number;
  y: number;
}

export default function PdfSignViewer({
  patientSelected,
}: {
  patientSelected: IPatientInfoCanKyTay;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const sigComponentRefs = useRef<Map<string, DraggableSignatureRef>>(
    new Map()
  );
  // Quan trọng: Lưu trữ element của từng trang để Portal chèn vào
  const [pageElements, setPageElements] = useState<Map<number, HTMLDivElement>>(
    new Map()
  );

  useEffect(() => {
    if (!patientSelected) return;
    renderIdRef.current++;
    renderPdf(renderIdRef.current);
  }, [patientSelected]);

  async function renderPdf(renderId: number) {
    const container = containerRef.current!;
    container.innerHTML = "";
    const newPageElements = new Map<number, HTMLDivElement>();

    const pdfData = Uint8Array.from(
      atob(patientSelected?.FilePdfKySo || ""),
      (c) => c.charCodeAt(0)
    );
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (renderId !== renderIdRef.current) return;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const pageWrapper = document.createElement("div");
      pageWrapper.className = "pdf-page-wrapper";
      pageWrapper.style.position = "relative"; // Gốc tọa độ cho chữ ký
      pageWrapper.style.width = `${viewport.width}px`;
      pageWrapper.style.margin = "16px auto";
      pageWrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        // Lấy tọa độ tương đối trong nội bộ 1 trang
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSignatures((prev) => [
          ...prev,
          { id: uuid(), page: pageNumber, x, y },
        ]);
      };

      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);

      // Lưu element vào state để trigger re-render cho Portal
      newPageElements.set(pageNumber, pageWrapper);
    }
    setPageElements(newPageElements);
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
    if (!patientSelected) return;

    const existingPdfBytes = Uint8Array.from(
      atob(patientSelected?.FilePdfKySo || ""),
      (c) => c.charCodeAt(0)
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    for (const sig of signatures) {
      const pageIndex = sig.page - 1;
      const pdfPage = pages[pageIndex];

      // Lấy kích thước thực tế của trang trong PDF (đơn vị points)
      const { width: pdfPageWidth, height: pdfPageHeight } = pdfPage.getSize();

      const sigRef = sigComponentRefs.current.get(sig.id);
      if (!sigRef) continue;

      const canvas = sigRef.getCanvas();
      if (!canvas) continue;

      // Chuyển canvas thành ảnh
      const pngImageBytes = await fetch(canvas.toDataURL()).then((res) =>
        res.arrayBuffer()
      );
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      // --- LOGIC TÍNH TOÁN TỌA ĐỘ CHÍNH XÁC ---

      // 1. Tỷ lệ scale khi render bằng PDF.js (bạn đang dùng 1.5)
      const renderScale = 1.5;

      // 2. Kích thước hiển thị của chữ ký trên trình duyệt (pixel)
      // Canvas của react-signature-canvas có width/height là kích thước thực tế của nó
      const sigDisplayWidth = canvas.width;
      const sigDisplayHeight = canvas.height;

      // 3. Chuyển đổi kích thước từ Pixel sang PDF Point
      // Công thức: PDF_Point = Pixel / renderScale
      const sigPdfWidth = sigDisplayWidth / renderScale;
      const sigPdfHeight = sigDisplayHeight / renderScale;

      // 4. Chuyển đổi tọa độ (x, y)
      // pdfX: Giữ nguyên tỷ lệ scale
      const pdfX = sig.x / renderScale;

      // pdfY: Đảo ngược trục Y vì PDF gốc tọa độ ở dưới cùng
      // Công thức: PDF_Y = Chiều_cao_trang - Y_trình_duyệt - Chiều_cao_vật_thể
      const pdfY = pdfPageHeight - sig.y / renderScale - sigPdfHeight;

      pdfPage.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: sigPdfWidth,
        height: sigPdfHeight,
      });
    }

    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true });

    // Tự động tải file
    const link = document.createElement("a");
    link.href = pdfBase64;
    link.download = `signed_document_${Date.now()}.pdf`;
    link.click();
  };

  return (
    <Box className="h-full flex flex-col overflow-hidden">
      <Box
        className="flex flex-row justify-between items-center"
        sx={{ p: 1, background: "#fff", borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold" }}>
          {`${patientSelected?.Hoten} (${patientSelected?.Gioitinh} - ${
            patientSelected?.Namsinh
          }) - ${patientSelected?.LoaiPhieu.replaceAll("_", " ")}`}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          size="small">
          Hoàn thành ký số
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
        {/* Render chữ ký vào đúng Page Wrapper bằng Portal */}
        {signatures.map((sig) => {
          const targetPageSlot = pageElements.get(sig.page);
          if (!targetPageSlot) return null;

          return createPortal(
            <DraggableSignature
              key={sig.id}
              ref={(el) => {
                if (el) sigComponentRefs.current.set(sig.id, el);
                else sigComponentRefs.current.delete(sig.id);
              }}
              sig={sig}
              onUpdatePos={updateSigPos}
              onDelete={deleteSig}
            />,
            targetPageSlot // Chèn component vào div của trang tương ứng
          );
        })}
      </Box>
    </Box>
  );
}
