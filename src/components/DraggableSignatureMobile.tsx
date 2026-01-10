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

const DraggableSignatureTouch = forwardRef<
  DraggableSignatureRef,
  DraggableSignatureProps
>(({ sig, onUpdatePos, onDelete }, ref) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: sig.x, y: sig.y });

  const [dimensions, setDimensions] = useState({ width: 180, height: 80 });

  useImperativeHandle(ref, () => ({
    getCanvas: () => sigRef.current?.getCanvas() || null,
    id: sig.id,
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // chỉ kéo khi chạm ngoài canvas
    if ((e.target as HTMLElement).tagName === "CANVAS") return;

    e.preventDefault();
    setDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: sig.x, y: sig.y };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    onUpdatePos(sig.id, startOffset.current.x + dx, startOffset.current.y + dy);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <Box
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      sx={{
        position: "absolute",
        left: sig.x,
        top: sig.y,
        zIndex: 100,
        touchAction: "none",
      }}>
      {/* Drag handle */}
      <IconButton
        size="small"
        sx={{
          position: "absolute",
          top: -12,
          left: -12,
          backgroundColor: "#1677ff",
          color: "white",
          zIndex: 102,
          "&:hover": { backgroundColor: "#006aff" },
        }}>
        <PanTool sx={{ fontSize: 16 }} />
      </IconButton>

      {/* Delete */}
      <IconButton
        className="actions"
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          position: "absolute",
          top: -12,
          right: -12,
          backgroundColor: "#ff4d4f",
          color: "#fff",
        }}>
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Signature box */}
      <Box
        ref={containerRef}
        sx={{
          width: 180,
          height: 80,
          resize: "both",
          overflow: "hidden",
          border: "2px dashed #0B3C8A",
          borderRadius: 1,
          backgroundColor: "rgba(255,255,255,0.8)",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "20px",
            height: "20px",
            cursor: "nwse-resize", // Con trỏ chuột kéo giãn chéo
            zIndex: 10,
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
              touchAction: "none", // QUAN TRỌNG cho iOS
            },
          }}
        />
      </Box>

      <Button
        className="!bg-green-500 !text-white !mt-0.5"
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

DraggableSignatureTouch.displayName = "DraggableSignatureTouch";

export default DraggableSignatureTouch;
