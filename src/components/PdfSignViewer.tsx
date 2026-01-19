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

  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Quản lý loading
  const [pageElements, setPageElements] = useState<Map<number, HTMLDivElement>>(
    new Map()
  );

  const sigComponentRefs = useRef<Map<string, DraggableSignatureRef>>(
    new Map()
  );

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Tự động load PDF khi đổi bệnh nhân
  useEffect(() => {
    if (!patientSelected) return;
    setSignatures([]); // Xóa chữ ký cũ
    renderIdRef.current++;
    renderPdf(renderIdRef.current);
  }, [patientSelected]);

  const toggleFullscreen = () => {
    const element = document.getElementById("box-ky-tay");
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(() => {});
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
      let pdfData;

      if (patientSelected?.FilePdfKySo) {
        pdfData = Uint8Array.from(
          atob(patientSelected?.FilePdfKySo || ""),
          (c) => c.charCodeAt(0)
        );
      } else if (patientSelected?.TaiLieuKy) {
        pdfData = Uint8Array.from(atob(patientSelected?.TaiLieuKy || ""), (c) =>
          c.charCodeAt(0)
        );
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (renderId !== renderIdRef.current) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const pageWrapper = document.createElement("div");
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
      console.error("Render PDF Error:", error);
    } finally {
      if (renderId === renderIdRef.current) setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (signatures.length === 0) {
      alert("Vui lòng click vào văn bản để tạo chữ ký.");
      return;
    }

    setIsLoading(true);
    try {
      let base64Data;
      if (patientSelected?.FilePdfKySo) {
        base64Data = patientSelected.FilePdfKySo.replace(/\s/g, "");
      } else if (patientSelected?.TaiLieuKy) {
        base64Data = patientSelected.TaiLieuKy.replace(/\s/g, "");
      }
      const existingPdfBytes = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);

      // --- SỬA LỖI FONT CHO IPAD TẠI ĐÂY ---
      const fontUrl = `${
        window.location.origin
      }/fonts/Roboto-Regular.ttf?v=${new Date().getTime()}`;
      const fontResponse = await fetch(fontUrl, { cache: "no-cache" });
      if (!fontResponse.ok)
        throw new Error("Không thể tải file font từ server.");

      // Quan trọng: Phải ép kiểu sang Uint8Array để Safari/iPad nhận diện đúng format
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      const fontBytes = new Uint8Array(fontArrayBuffer);
      const customFont = await pdfDoc.embedFont(fontBytes);
      // --------------------------------------

      const pages = pdfDoc.getPages();

      for (const sig of signatures) {
        const sigRef = sigComponentRefs.current.get(sig.id);
        if (!sigRef) continue;

        const canvas = sigRef.getCanvas();
        const fullName = sigRef.getFullName();
        if (!canvas) continue;

        const pngImageBytes = await fetch(canvas.toDataURL("image/png")).then(
          (res) => res.arrayBuffer()
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
      const fileKySo = await KySoBenhVien(pdfBase64);

      if (!fileKySo) {
        throw new Error("Ký số thất bại.");
      }

      await updateFilePatientKyTay(patientSelected.ID, fileKySo);

      ToastSuccess("Ký thành công");

      setSignatures([]);
      patientSelected.FilePdfKySo = fileKySo;
      renderIdRef.current++;
      await renderPdf(renderIdRef.current);
    } catch (error) {
      console.error("Lỗi khi ký tài liệu:", error);
      alert(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const KySoBenhVien = async (pdfBase64: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/ky-so", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: pdfBase64,
          fileName: patientSelected?.LoaiPhieu.replaceAll("_", " "),
          position: "b-m",
        }),
      });

      const fileKySo = await res.json();

      console.log("Access Token:", fileKySo);

      return fileKySo;
    } catch (error) {
      console.error("Lỗi khi ký tài liệu:", error);
      alert(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."
      );

      return null;
    }
  };

  return (
    <Box
      id="box-ky-tay"
      className="h-full flex flex-col overflow-hidden"
      sx={{
        position: "relative", // Bắt buộc để Backdrop phủ đúng vị trí
        background: "#fff",
        "&:fullscreen": {
          backgroundColor: "#f5f5f5",
          width: "100vw",
          height: "100vh",
          p: 1,
        },
      }}>
      {/* Màn hình chờ khi đang Render hoặc đang Lưu */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          position: "absolute",
          flexDirection: "column",
          gap: 2,
        }}
        open={isLoading}>
        <CircularProgress color="inherit" />
        <Typography>Đang xử lý tài liệu...</Typography>
      </Backdrop>

      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
        }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", color: "#1976d2" }}>
          {patientSelected?.Hoten} -{" "}
          {patientSelected?.LoaiPhieu.replaceAll("_", " ")}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" onClick={toggleFullscreen}>
            {isFullscreen ? "Thoát" : "Toàn màn hình"}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={isLoading}>
            Hoàn thành
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
              onUpdatePos={(id, x, y) =>
                setSignatures((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, x, y } : s))
                )
              }
              onDelete={(id) =>
                setSignatures((prev) => prev.filter((s) => s.id !== id))
              }
              patientSelected={patientSelected}
            />,
            targetPageSlot
          );
        })}
      </Box>
    </Box>
  );
}
