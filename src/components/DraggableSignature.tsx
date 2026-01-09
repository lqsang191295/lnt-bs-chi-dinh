"use client";

import { ClearAll as ClearIcon, Close as CloseIcon } from "@mui/icons-material";
import { Box, Button, IconButton } from "@mui/material";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import SignatureCanvas from "react-signature-canvas";

interface DraggableSignatureProps {
  sig: { id: string; x: number; y: number };
  onUpdatePos: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

export interface DraggableSignatureRef {
  getCanvas: () => HTMLCanvasElement | null;
  id: string;
}

const DraggableSignature = forwardRef<
  DraggableSignatureRef,
  DraggableSignatureProps
>(({ sig, onUpdatePos, onDelete }, ref) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggable, setIsDraggable] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 180, height: 80 });

  useImperativeHandle(ref, () => ({
    getCanvas: () => sigRef.current?.getCanvas() || null,
    id: sig.id,
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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

  return (
    <Box
      sx={{
        position: "absolute",
        left: sig.x,
        top: sig.y,
        cursor: isDraggable ? "move" : "crosshair",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "15px", // Tăng padding để dễ chạm
      }}
      draggable={isDraggable}
      onDragEnd={handleDragEnd}>
      {/* Nút Xóa - LUÔN HIỆN */}
      <IconButton
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          backgroundColor: "#ff4d4f",
          color: "white",
          zIndex: 102,
          "&:hover": { backgroundColor: "#d9363e" },
        }}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Box
        ref={containerRef}
        onMouseDown={() => setIsDraggable(false)}
        onMouseUp={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(true)}
        sx={{
          width: 180,
          height: 80,
          border: "1px dashed #0B3C8A",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "4px",
          position: "relative",
          touchAction: "none", // Quan trọng cho signature trên mobile
        }}>
        <SignatureCanvas
          ref={sigRef}
          penColor="#0B3C8A"
          canvasProps={{
            width: dimensions.width,
            height: dimensions.height,
            style: { display: "block", cursor: "crosshair" },
          }}
        />
      </Box>

      <Button
        variant="contained"
        size="small"
        onClick={() => sigRef.current?.clear()}
        startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
        sx={{
          mt: 1,
          fontSize: "10px",
          textTransform: "none",
          backgroundColor: "#52c41a",
        }}>
        Clear
      </Button>
    </Box>
  );
});

// Gán displayName để fix lỗi ESLint
DraggableSignature.displayName = "DraggableSignature";

export default DraggableSignature;
