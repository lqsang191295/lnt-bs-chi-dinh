"use client";

import {
  ClearAll as ClearIcon,
  Close as CloseIcon,
  PanTool,
} from "@mui/icons-material";
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

  // Hỗ trợ lấy ref từ component cha
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
        padding: "4px",
        "&:hover .action-buttons": { opacity: 1 },
      }}
      draggable={isDraggable}
      onDragEnd={handleDragEnd}>
      <IconButton
        className="action-buttons"
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          position: "absolute",
          top: -5,
          left: -5,
          backgroundColor: "#ff4d4f",
          color: "white",
          padding: "2px",
          opacity: 0,
          zIndex: 102,
          transition: "opacity 0.2s",
          "&:hover": { backgroundColor: "#d9363e" },
        }}>
        <PanTool sx={{ fontSize: 14 }} />
      </IconButton>

      <IconButton
        className="action-buttons"
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          position: "absolute",
          top: -5,
          right: -5,
          backgroundColor: "#ff4d4f",
          color: "white",
          padding: "2px",
          opacity: 0,
          zIndex: 102,
          transition: "opacity 0.2s",
          "&:hover": { backgroundColor: "#d9363e" },
        }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>

      <Box
        ref={containerRef}
        onMouseDown={() => setIsDraggable(false)}
        onMouseUp={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(true)}
        sx={{
          width: 180,
          height: 80,
          minWidth: 100,
          minHeight: 50,
          maxWidth: 400,
          maxHeight: 250,
          border: "1px dashed #0B3C8A",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
          resize: "both",
          "&::-webkit-resizer": {
            backgroundColor: "#0B3C8A",
          },
        }}>
        <SignatureCanvas
          ref={sigRef}
          penColor="#0B3C8A"
          minWidth={1}
          maxWidth={1.2}
          canvasProps={{
            width: dimensions.width,
            height: dimensions.height,
            style: {
              display: "block",
              cursor: "crosshair",
            },
          }}
        />
      </Box>

      <Button
        className="action-buttons"
        variant="contained"
        size="small"
        onClick={() => sigRef.current?.clear()}
        startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
        sx={{
          mt: 0.5,
          fontSize: "10px",
          padding: "2px 8px",
          textTransform: "none", // Fix lỗi type tại đây
          opacity: 0,
          transition: "opacity 0.2s",
          backgroundColor: "#52c41a",
          "&:hover": { backgroundColor: "#73d13d" },
        }}>
        Clear
      </Button>
    </Box>
  );
});

// Gán displayName để fix lỗi ESLint
DraggableSignature.displayName = "DraggableSignature";

export default DraggableSignature;
