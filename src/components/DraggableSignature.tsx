"use client";

import {
  ClearAll as ClearIcon,
  Close as CloseIcon,
  PanTool,
} from "@mui/icons-material";
import { Box, Button, IconButton, TextField } from "@mui/material";
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
  getFullName: () => string; // Thêm hàm lấy tên
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
  const [fullName, setFullName] = useState(""); // State lưu họ tên

  useImperativeHandle(ref, () => ({
    getCanvas: () => sigRef.current?.getCanvas() || null,
    getFullName: () => fullName, // Cho phép component cha lấy tên
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
        gap: 0.5, // Tạo khoảng cách nhỏ giữa các thành phần
      }}
      draggable={isDraggable}
      onDragEnd={handleDragEnd}>
      {/* Nút kéo */}
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
        <PanTool sx={{ fontSize: 10 }} />
      </IconButton>

      {/* Nút Xóa */}
      <IconButton
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          width: 18,
          height: 18,
          position: "absolute",
          top: -12,
          right: -12,
          backgroundColor: "#ff4d4f",
          color: "white",
          zIndex: 102,
          "&:hover": { backgroundColor: "#d9363e" },
        }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>

      {/* Vùng Vẽ Chữ Ký */}
      <Box
        ref={containerRef}
        onMouseDown={() => setIsDraggable(false)}
        onMouseUp={() => setIsDraggable(true)}
        onMouseLeave={() => setIsDraggable(true)}
        sx={{
          width: 180,
          height: 80,
          border: "2px dashed #0B3C8A",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "4px",
          position: "relative",
          touchAction: "none",
          overflow: "hidden",
          resize: "both",
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
          }}
        />
      </Box>

      {/* TextField Nhập Họ Tên - Đặt ở dưới canvas */}
      <TextField
        size="small"
        placeholder="Họ tên..."
        variant="outlined"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        onFocus={() => setIsDraggable(false)} // Tắt drag khi đang gõ
        onBlur={() => setIsDraggable(true)} // Bật lại drag khi gõ xong
        sx={{
          width: "100%",
          backgroundColor: "white",
          "& .MuiInputBase-input": {
            fontSize: "12px",
            padding: "4px 8px",
            textAlign: "center",
          },
        }}
      />

      <Button
        variant="contained"
        size="small"
        onClick={() => sigRef.current?.clear()}
        startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
        sx={{
          fontSize: "10px",
          textTransform: "none",
          backgroundColor: "#52c41a",
          "&:hover": { backgroundColor: "#389e0d" },
        }}>
        Xóa chữ ký
      </Button>
    </Box>
  );
});

DraggableSignature.displayName = "DraggableSignature";
export default DraggableSignature;
