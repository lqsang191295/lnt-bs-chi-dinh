"use client";

import { ClearAll as ClearIcon, Close as CloseIcon } from "@mui/icons-material";
import { Box, Button, IconButton } from "@mui/material";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface DraggableSignatureProps {
  sig: { id: string; x: number; y: number };
  onUpdatePos: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void; // Thêm prop xóa
}

export default function DraggableSignature({
  sig,
  onUpdatePos,
  onDelete,
}: DraggableSignatureProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  const handleDragEnd = (e: React.DragEvent) => {
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    if (e.clientX !== 0 && e.clientY !== 0) {
      onUpdatePos(sig.id, newX, newY);
    }
  };

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: sig.x,
        top: sig.y,
        transform: "translate(-50%, -50%)",
        cursor: "move",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        "&:hover .action-buttons": { opacity: 1 },
      }}
      draggable
      onDragEnd={handleDragEnd}>
      {/* Nút X xóa nằm ở góc trên bên phải Canvas */}
      <IconButton
        className="action-buttons"
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          position: "absolute",
          top: -12,
          right: -12,
          backgroundColor: "#ff4d4f",
          color: "white",
          padding: "2px",
          opacity: 0, // Chỉ hiện khi hover vào box
          transition: "opacity 0.2s",
          "&:hover": { backgroundColor: "#ff7875" },
        }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>

      <SignatureCanvas
        ref={sigRef}
        penColor="#0B3C8A"
        minWidth={1}
        maxWidth={1.2}
        canvasProps={{
          width: 180,
          height: 80,
          style: {
            border: "1px dashed #0B3C8A",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: "4px",
          },
        }}
      />

      {/* Nút Clear chữ ký */}
      <Button
        className="action-buttons"
        variant="contained"
        size="small"
        onClick={clearSignature}
        startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
        sx={{
          fontSize: "10px",
          padding: "2px 8px",
          textTransform: "none",
          opacity: 0,
          transition: "opacity 0.2s",
          backgroundColor: "#52c41a",
          "&:hover": { backgroundColor: "#73d13d" },
        }}>
        Clear
      </Button>
    </Box>
  );
}
