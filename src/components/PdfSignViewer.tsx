"use client";

import { updateFilePatientKyTay } from "@/actions/act_patient";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { ToastError, ToastSuccess } from "@/utils/toast";
import { Box, Button, Typography } from "@mui/material";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuid } from "uuid";
import DraggableSignature, {
  DraggableSignatureRef,
} from "./DraggableSignature";
import DraggableSignatureMobile from "./DraggableSignatureMobile";

// Icon (Tùy chọn: nếu bạn đã cài @mui/icons-material)
// import FullscreenIcon from '@mui/icons-material/Fullscreen';
// import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
  const isTouchDevice = useIsTouchDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false); // State quản lý toàn màn hình

  const sigComponentRefs = useRef<Map<string, DraggableSignatureRef>>(
    new Map()
  );
  const [pageElements, setPageElements] = useState<Map<number, HTMLDivElement>>(
    new Map()
  );

  // Theo dõi sự kiện thay đổi fullscreen (nhấn ESC hoặc nút thoát của trình duyệt)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    if (!patientSelected) return;
    renderIdRef.current++;
    renderPdf(renderIdRef.current);
  }, [patientSelected]);

  const toggleFullscreen = () => {
    const element = document.getElementById("box-ky-tay");
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Lỗi khi mở toàn màn hình: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
      const viewport = page.getViewport({ scale: 1.5 }); // Đã chỉnh scale 1.5 cho đồng bộ với logic handleSave của bạn

      const pageWrapper = document.createElement("div");
      pageWrapper.className = "pdf-page-wrapper";
      pageWrapper.style.position = "relative";
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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSignatures((prev) => [
          ...prev,
          { id: uuid(), page: pageNumber, x, y },
        ]);
      };

      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);
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
    try {
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
        const { height: pdfPageHeight } = pdfPage.getSize();

        const sigRef = sigComponentRefs.current.get(sig.id);
        if (!sigRef) continue;

        // 1. Lấy Canvas chữ ký và Họ tên từ Ref
        const canvas = sigRef.getCanvas();
        const fullName = sigRef.getFullName?.() || ""; // Hàm này chúng ta đã thêm ở bước trước
        if (!canvas) continue;

        // 2. Nhúng hình ảnh chữ ký
        const pngImageBytes = await fetch(canvas.toDataURL()).then((res) =>
          res.arrayBuffer()
        );
        const pngImage = await pdfDoc.embedPng(pngImageBytes);

        const renderScale = 1.5;
        const sigPdfWidth = canvas.width / renderScale;
        const sigPdfHeight = canvas.height / renderScale;
        const pdfX = sig.x / renderScale;
        const pdfY = pdfPageHeight - sig.y / renderScale - sigPdfHeight;

        // Vẽ chữ ký lên PDF
        pdfPage.drawImage(pngImage, {
          x: pdfX,
          y: pdfY,
          width: sigPdfWidth,
          height: sigPdfHeight,
        });

        // 3. VẼ HỌ TÊN VÀO PDF (Nằm dưới chữ ký)
        if (fullName) {
          pdfPage.drawText(fullName, {
            x: pdfX + sigPdfWidth / 2 - fullName.length * 2.5, // Căn giữa tương đối
            y: pdfY - 15, // Đặt bên dưới chữ ký 15 đơn vị
            size: 10, // Cỡ chữ
            // font: ... bạn có thể nhúng font tiếng Việt nếu cần (xem lưu ý dưới)
            color: rgb(0.043, 0.235, 0.541),
          });
        }
      }

      const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: false });
      await updateFilePatientKyTay(patientSelected.ID, pdfBase64);

      ToastSuccess("Ký thành công!");
    } catch (error) {
      console.error("Lỗi khi ký tài liệu:", error);
      ToastError("Lỗi khi ký tài liệu!");
    }
  };

  return (
    <Box
      id="box-ky-tay"
      className="h-full flex flex-col overflow-hidden"
      sx={{
        background: "#fff",
        // CSS đảm bảo khi mở Fullscreen vẫn giữ màu nền và layout
        "&:fullscreen": {
          backgroundColor: "#f5f5f5",
          width: "100vw",
          height: "100vh",
          padding: "10px",
        },
      }}>
      <Box
        className="flex flex-row justify-between items-center"
        sx={{ p: 1, background: "#fff", borderBottom: "1px solid #ddd" }}>
        <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold" }}>
          {`${patientSelected?.Hoten} (${patientSelected?.Gioitinh} - ${
            patientSelected?.Namsinh
          }) - ${patientSelected?.LoaiPhieu.replaceAll("_", " ")}`}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleFullscreen}
            size="small">
            {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            size="small">
            Hoàn thành ký số
          </Button>
        </Box>
      </Box>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          background: "#f5f5f5",
          position: "relative",
          p: 2,
        }}>
        {signatures.map((sig) => {
          const targetPageSlot = pageElements.get(sig.page);
          if (!targetPageSlot) return null;

          const SigComponent = isTouchDevice
            ? DraggableSignatureMobile
            : DraggableSignature;

          return createPortal(
            <SigComponent
              key={sig.id}
              ref={(el) => {
                if (el) sigComponentRefs.current.set(sig.id, el);
                else sigComponentRefs.current.delete(sig.id);
              }}
              sig={sig}
              onUpdatePos={updateSigPos}
              onDelete={deleteSig}
            />,
            targetPageSlot
          );
        })}
      </Box>
    </Box>
  );
}
