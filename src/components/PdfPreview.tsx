"use client";

import { Visibility } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// cần config worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfPreviewProps = {
  base64: string;
  onOpen?: () => void;
  interactive?: boolean;
  filename?: string;
};

function PdfPreview({
  base64,
  filename,
  interactive = false,
  onOpen,
}: PdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    if (base64) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [base64]);

  return (
    <Box
      onClick={!interactive ? onOpen : undefined}
      className="relative w-full h-full cursor-pointer group"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        ...(interactive
          ? {}
          : {
              boxShadow: 1,
              "&:hover": {
                boxShadow: 4,
                transform: "scale(1.02)",
                transition: "transform 0.2s",
              },
            }),
        minHeight: 200,
      }}>
      {pdfUrl && (
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p>Đang tải PDF...</p>}
          error={<p>Không thể hiển thị PDF</p>}>
          {!interactive && <Page pageNumber={1} width={200} />}
          {interactive &&
            Array.from(new Array(numPages), (_, i) => (
              <Page key={`page_${i + 1}`} pageNumber={i + 1} width={600} />
            ))}
        </Document>
      )}

      {!interactive && (
        <Box
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          sx={{ bgcolor: "rgba(0,0,0,0.5)" }}>
          <Visibility sx={{ fontSize: 40, color: "white" }} />
        </Box>
      )}

      <Typography
        className="absolute bottom-0 left-0 right-0 bg-black/50 text-white"
        sx={{ textAlign: "center", p: 1 }}>
        {filename}
      </Typography>
    </Box>
  );
}

export default memo(PdfPreview);
