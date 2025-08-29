"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useState } from "react";

export interface iImageGallery {
  filename: string;
  url: string;
}

type Props = {
  files: iImageGallery[];
};

export default function ImageGallery({ files }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const currentFile = index !== null ? files[index] : null;
  const isPdf = currentFile ? /\.pdf$/i.test(currentFile.url) : false;

  const close = () => setIndex(null);
  const prev = () =>
    setIndex((prev) => (prev! - 1 + files.length) % files.length);
  const next = () => setIndex((prev) => (prev! + 1) % files.length);
  const download = () => {
    if (!currentFile) return;
    const link = document.createElement("a");
    link.href = currentFile.url;
    link.download = currentFile.filename;
    link.click();
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {files.map((f, i) => (
          <Box key={i}>{f.filename}</Box>
        ))}
      </div>

      <Dialog
        open={index !== null}
        onClose={close}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100%",
            maxWidth: "unset",
            maxHeight: "unset",
            m: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            boxShadow: "none",
          },
        }}>
        <DialogContent
          sx={{
            p: 2,
            display: "grid",
            gridTemplateRows: "auto 1fr",
            "&::-webkit-scrollbar": { display: "none" }, // Ẩn scrollbar
            msOverflowStyle: "none",
          }}>
          {/* Header với tên file và các nút */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
              position: "relative",
            }}>
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "medium",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "80%",
              }}>
              {currentFile?.filename}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                position: "absolute",
                right: 0,
              }}>
              <IconButton
                onClick={download}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "white" }}>
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={close}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Nội dung chính: Hình ảnh/PDF và các nút điều hướng */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              gap: 2,
            }}>
            <IconButton
              onClick={prev}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
              }}>
              <ChevronLeftIcon sx={{ fontSize: "2rem" }} />
            </IconButton>

            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}>
              {isPdf ? (
                <Box
                  component="iframe"
                  src={currentFile?.url}
                  sx={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : (
                <Image
                  src={currentFile?.url ?? ""}
                  alt={currentFile?.filename ?? ""}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                  width={800} // Cần thiết cho Next/Image
                  height={600}
                  unoptimized
                />
              )}
            </Box>

            <IconButton
              onClick={next}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
              }}>
              <ChevronRightIcon sx={{ fontSize: "2rem" }} />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
