"use client";

import { updateFilePatientKyTay } from "@/actions/act_patient";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { IPatientInfoCanKyTay } from "@/model/tpatient";
import { ToastSuccess } from "@/utils/toast";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuid } from "uuid";
import DraggableSignature, {
  DraggableSignatureRef,
} from "./DraggableSignature";
import DraggableSignatureMobile from "./DraggableSignatureMobile";

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

  // State quản lý loading và dữ liệu
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageElements, setPageElements] = useState<Map<number, HTMLDivElement>>(
    new Map()
  );

  const sigComponentRefs = useRef<Map<string, DraggableSignatureRef>>(
    new Map()
  );

  // Theo dõi sự kiện thay đổi fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Load PDF khi bệnh nhân thay đổi
  useEffect(() => {
    if (!patientSelected) return;
    setSignatures([]); // Reset chữ ký khi đổi bệnh nhân
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
    setIsLoading(true);
    try {
      const container = containerRef.current!;
      container.innerHTML = "";
      const newPageElements = new Map<number, HTMLDivElement>();

      const pdfData = Uint8Array.from(
        atob(patientSelected?.FilePdfKySo || ""),
        (c) => c.charCodeAt(0)
      );
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        // Kiểm tra nếu có lượt render mới thì dừng lượt cũ
        if (renderId !== renderIdRef.current) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const pageWrapper = document.createElement("div");
        pageWrapper.className = "pdf-page-wrapper";
        pageWrapper.style.position = "relative";
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.margin = "16px auto";
        pageWrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        pageWrapper.style.backgroundColor = "#fff";

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
    } catch (error) {
      console.error("Lỗi khi render PDF:", error);
    } finally {
      // Chỉ tắt loading nếu đây vẫn là yêu cầu render mới nhất
      if (renderId === renderIdRef.current) {
        setIsLoading(false);
      }
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
    if (signatures.length === 0) {
      alert("Vui lòng click vào văn bản để tạo chữ ký trước khi hoàn thành.");
      return;
    }

    setIsLoading(true);
    try {
      if (!patientSelected) return;

      // 1. Load PDF
      const base64Data = patientSelected.FilePdfKySo.replace(/\s/g, "");
      const existingPdfBytes = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);

      // 2. Load Font với cơ chế chống cache lỗi trên iPad
      const fontUrl = `${
        window.location.origin
      }/fonts/Roboto-Regular.ttf?v=${new Date().getTime()}`;
      const fontResponse = await fetch(fontUrl, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!fontResponse.ok)
        throw new Error("Không thể tải font Roboto-Regular.ttf");

      // Đảm bảo lấy ArrayBuffer chuẩn
      const fontBytes = await fontResponse.arrayBuffer();

      // KIỂM TRA QUAN TRỌNG: Thử nạp font, nếu lỗi dùng font mặc định StandardFonts
      let customFont;
      try {
        customFont = await pdfDoc.embedFont(fontBytes);
      } catch (fontError) {
        console.error(
          "Font embedding failed, falling back to Helvetica:",
          fontError
        );
        // Nếu font ttf lỗi trên iPad, dùng font mặc định (không hỗ trợ tiếng Việt có dấu tốt bằng ttf)
        // customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        throw new Error(
          "Định dạng Font không hỗ trợ trên thiết bị này. Vui lòng kiểm tra lại file .ttf"
        );
      }

      const pages = pdfDoc.getPages();

      for (const sig of signatures) {
        const sigRef = sigComponentRefs.current.get(sig.id);
        if (!sigRef) continue;

        const canvas = sigRef.getCanvas();
        const fullName = sigRef.getFullName();
        if (!canvas) continue;

        // Chuyển canvas sang Image Bytes
        const dataUrl = canvas.toDataURL("image/png");
        const pngImageBytes = await fetch(dataUrl).then((res) =>
          res.arrayBuffer()
        );
        const pngImage = await pdfDoc.embedPng(pngImageBytes);

        const pdfPage = pages[sig.page - 1];
        const { height: pdfPageHeight } = pdfPage.getSize();
        const renderScale = 1.5;

        const sigPdfWidth = canvas.width / renderScale;
        const sigPdfHeight = canvas.height / renderScale;
        const pdfX = sig.x / renderScale;
        const pdfY = pdfPageHeight - sig.y / renderScale - sigPdfHeight;

        pdfPage.drawImage(pngImage, {
          x: pdfX,
          y: pdfY,
          width: sigPdfWidth,
          height: sigPdfHeight,
        });

        if (fullName) {
          const fontSize = 11;
          const textWidth = customFont.widthOfTextAtSize(fullName, fontSize);
          pdfPage.drawText(fullName, {
            x: pdfX + sigPdfWidth / 2 - textWidth / 2,
            y: pdfY - 15,
            size: fontSize,
            font: customFont,
            color: rgb(0.043, 0.235, 0.541),
          });
        }
      }

      const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: false });
      await updateFilePatientKyTay(patientSelected.ID, pdfBase64);
      ToastSuccess("Ký thành công");
    } catch (error) {
      console.error("Lỗi khi ký tài liệu:", error);
      alert(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      id="box-ky-tay"
      className="h-full flex flex-col overflow-hidden"
      sx={{
        position: "relative", // Quan trọng để Backdrop phủ đúng vị trí
        background: "#fff",
        "&:fullscreen": {
          backgroundColor: "#f5f5f5",
          width: "100vw",
          height: "100vh",
          padding: "10px",
        },
      }}>
      {/* Loading Overlay */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute", // Phủ trong giới hạn của Box cha
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        open={isLoading}>
        <CircularProgress color="inherit" />
        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
          Đang xử lý dữ liệu...
        </Typography>
      </Backdrop>

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
            disabled={isLoading}
            size="small">
            {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isLoading || signatures.length === 0}
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
