"use client";

import PdfHandler from "@/utils/PdfHandler";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close,
  Visibility,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { memo, useEffect, useState } from "react";

export interface iPdfGallery {
  filename: string;
  base64: string;
}

type Props = {
  files: iPdfGallery[];
};

/* ---------- Thumbnail component ---------- */
const PDFThumbnail = memo(function PDFThumbnail({
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
          <div
            className="relative w-full h-full"
            style={{
              overflow: "hidden", // ẩn scroll bar
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <object
              data={pdfUrl}
              type="application/pdf"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                overflow: "hidden",
              }}>
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
});

/* ---------- Main gallery ---------- */
function PdfGallery({ files }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const currentFile = index !== null ? files[index] : null;
  const numPages = files.length;

  const close = () => setIndex(null);
  const prev = () => setIndex((prev) => (prev! - 1 + numPages) % numPages);
  const next = () => setIndex((prev) => (prev! + 1) % numPages);

  if (!files || files.length === 0) {
    return <Typography>Không có file PDF</Typography>;
  }
  console.log("files 123123", files);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
        }}>
        {files.map((f, i) => (
          <PDFThumbnail key={i} file={f} onOpen={() => setIndex(i)} />
          // <ComponentPdfPreview
          //   key={i}
          //   base64={f.base64}
          //   interactive={false}
          //   onOpen={() => setIndex(i)}
          // />
        ))}

        {/* {files && files.length > 0 && (
          <ComponentPdfPreview
            base64={files[0].base64}
            interactive={false}
            onOpen={() => setIndex(0)}
          />
        )} */}
      </Box>

      {currentFile && (
        <Dialog
          open
          onClose={close}
          fullWidth
          maxWidth="xl"
          slotProps={{
            paper: {
              sx: {
                boxShadow: "none",
                background: "none",
                margin: 0,
                width: "100%",
                height: "100%",
                maxHeight: "100vh",
              },
              elevation: 0,
            },
          }}>
          <DialogContent
            sx={{
              background: "none",
              py: 0,
              px: 0,
              display: "grid",
              gridTemplateRows: "auto 1fr",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              height: "100vh",
            }}>
            <Box
              className="relative"
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100vh",
                gap: 2,
              }}>
              <Box sx={{ flex: 1, width: "100%", height: "100%" }}>
                <PDFThumbnail file={currentFile} interactive />
              </Box>

              <IconButton
                onClick={close}
                sx={{
                  position: "absolute",
                  width: 39,
                  height: 39,
                  top: 60,
                  right: 20,
                  bgcolor: "rgba(23, 23, 23, 0.5)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(23, 23, 23, 0.75)" },
                }}>
                <Close sx={{ fontSize: "2rem" }} />
              </IconButton>

              <IconButton
                className="absolute top-0 bottom-0 left-0"
                onClick={prev}
                sx={{
                  position: "absolute",
                  width: 39,
                  height: 39,
                  top: "50%",
                  left: 15,
                  bgcolor: "rgba(23, 23, 23, 0.5)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(23, 23, 23, 0.75)" },
                }}>
                <ChevronLeftIcon sx={{ fontSize: "2rem" }} />
              </IconButton>

              <IconButton
                className="absolute top-0 bottom-0 right-0"
                onClick={next}
                sx={{
                  position: "absolute",
                  width: 39,
                  height: 39,
                  top: "50%",
                  right: 15,
                  bgcolor: "rgba(23, 23, 23, 0.5)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(23, 23, 23, 0.75)" },
                }}>
                <ChevronRightIcon sx={{ fontSize: "2rem" }} />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
export default memo(PdfGallery);
