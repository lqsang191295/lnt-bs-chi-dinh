"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import { memo, useState } from "react";
import PdfViewer from "./PdfView";

export interface iPdfGallery {
  filename: string;
  base64: string;
}

type Props = {
  files: iPdfGallery[];
};

const ComponentPdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false, // Dòng này là mấu chốt: Tắt Server-Side Rendering cho component này
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
          <ComponentPdfPreview
            key={i}
            base64={f.base64}
            interactive={false}
            onOpen={() => setIndex(i)}
            filename={f.filename}
          />
        ))}
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
                <PdfViewer file={currentFile} interactive />
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
