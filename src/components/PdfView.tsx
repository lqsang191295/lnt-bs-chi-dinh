"use client";

import PdfHandler from "@/utils/PdfHandler";
import { Visibility } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo, useEffect, useState } from "react";

export interface iPdfGallery {
  filename: string;
  base64: string;
}

function PdfViewer({
  file,
  onOpen,
  interactive = false,
}: {
  file: iPdfGallery;
  onOpen?: () => void;
  interactive?: boolean;
}) {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    if (!file?.base64 || !PdfHandler.validatePdfData(file.base64)) return;

    const newUrl = PdfHandler.createPdfBlobUrl(file.base64);
    setPdfUrl(newUrl);

    return () => {
      PdfHandler.cleanupBlobUrl(newUrl);
    };
  }, [file]);

  return (
    <Box
      onClick={!interactive ? onOpen : undefined}
      className={`relative h-full ${interactive ? "" : "group cursor-pointer"}`}
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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
          overflow: "hidden",
        }}>
        {pdfUrl && (
          <div className="relative w-full h-full overflow-hidden">
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: "none" }}>
              <p>
                Thiết bị không hỗ trợ xem PDF.
                <a href={pdfUrl}>Tải về tại đây</a>
              </p>
            </object>
            {!interactive && (
              <div className="absolute inset-0 bg-transparent" />
            )}
          </div>
        )}
      </Box>

      {/* Hover overlay chỉ ở preview mode */}
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
        {file.filename}
      </Typography>
    </Box>
  );
}

export default memo(PdfViewer);
