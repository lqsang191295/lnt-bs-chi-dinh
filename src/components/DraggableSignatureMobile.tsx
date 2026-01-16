"use client";

import { IPatientInfoCanKyTay } from "@/model/tpatient";
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
  patientSelected: IPatientInfoCanKyTay;
}

export interface DraggableSignatureRef {
  getCanvas: () => HTMLCanvasElement | null;
  getFullName: () => string; // Thêm hàm lấy tên
  id: string;
}

const DraggableSignatureTouch = forwardRef<
  DraggableSignatureRef,
  DraggableSignatureProps
>(({ sig, onUpdatePos, onDelete, patientSelected }, ref) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: sig.x, y: sig.y });
  const [fullName, setFullName] = useState(patientSelected?.Hoten); // State lưu họ tên
  const [dimensions, setDimensions] = useState({ width: 180, height: 80 });

  useImperativeHandle(ref, () => ({
    getCanvas: () => sigRef.current?.getCanvas() || null,
    getFullName: () => fullName,
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
    // 1. Nếu chạm vào Canvas để ký -> Thoát
    if ((e.target as HTMLElement).tagName === "CANVAS") return;

    // 2. Nếu chạm vào INPUT hoặc TEXTAREA để nhập liệu -> Thoát, KHÔNG dùng preventDefault
    const tagName = (e.target as HTMLElement).tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA") return;

    // 3. Chỉ thực hiện logic kéo thả cho các vùng còn lại (handle, khung viền...)
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5, // Tạo khoảng cách nhỏ giữa các thành phần
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
        <PanTool sx={{ fontSize: 12 }} />
      </IconButton>

      {/* Delete */}
      <IconButton
        className="actions"
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          width: 18,
          height: 18,
          position: "absolute",
          top: -12,
          right: -12,
          backgroundColor: "#ff4d4f",
          color: "#fff",
        }}>
        <CloseIcon sx={{ fontSize: 14 }} />
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
      {/* TextField Nhập Họ Tên - Đặt ở dưới canvas */}
      <TextField
        size="small"
        placeholder="Họ tên..."
        variant="outlined"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        sx={{
          width: "100%",
          backgroundColor: "white",
          "& .MuiInputBase-input": {
            fontSize: "12px",
            padding: "4px 8px",
            textAlign: "center",
          },
          "& input": {
            userSelect: "text",
            WebkitUserSelect: "text",
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

DraggableSignatureTouch.displayName = "DraggableSignatureTouch";

export default DraggableSignatureTouch;
