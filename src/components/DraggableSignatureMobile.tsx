"use client";

import { IPatientInfoCanKyTay } from "@/model/tpatient";
import {
  ClearAll as ClearIcon,
  Close as CloseIcon,
  PanTool,
} from "@mui/icons-material";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface DraggableSignatureProps {
  sig: { id: string; x: number; y: number };
  onUpdatePos: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  patientSelected: IPatientInfoCanKyTay;
}

export interface DraggableSignatureRef {
  getCanvas: () => HTMLCanvasElement | null;
  getFullName: () => string;
  id: string;
}

const DraggableSignatureTouch = forwardRef<
  DraggableSignatureRef,
  DraggableSignatureProps
>(({ sig, onUpdatePos, onDelete, patientSelected }, ref) => {
  const sigRef = useRef<SignatureCanvas>(null);

  // State quản lý trạng thái
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [fullName, setFullName] = useState(patientSelected?.Hoten || "");
  const [dimensions, setDimensions] = useState({ width: 200, height: 100 });

  // Ref lưu vị trí bắt đầu để tính toán khoảng cách di chuyển
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: sig.x, y: sig.y });
  const startSize = useRef({ width: 200, height: 100 });

  useImperativeHandle(ref, () => ({
    getCanvas: () => sigRef.current?.getCanvas() || null,
    getFullName: () => fullName,
    id: sig.id,
  }));

  // --- XỬ LÝ DI CHUYỂN (MOVE) ---
  const handleMoveDown = (e: React.PointerEvent) => {
    // Không cho phép kéo khi đang tương tác với Input hoặc Canvas
    if (
      (e.target as HTMLElement).tagName === "INPUT" ||
      (e.target as HTMLElement).tagName === "CANVAS"
    )
      return;

    e.preventDefault();
    setDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: sig.x, y: sig.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // --- XỬ LÝ KÉO RỘNG (RESIZE) ---
  const handleResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Ngừng sự kiện kéo di chuyển của Box cha
    setResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: dimensions.width, height: dimensions.height };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // --- XỬ LÝ KHI DI CHUYỂN CHUỘT/NGÓN TAY ---
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      onUpdatePos(
        sig.id,
        startOffset.current.x + dx,
        startOffset.current.y + dy
      );
    }

    if (resizing) {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      setDimensions({
        width: Math.max(120, startSize.current.width + dx), // Min width 120
        height: Math.max(60, startSize.current.height + dy), // Min height 60
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    setResizing(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <Box
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      sx={{
        position: "absolute",
        left: sig.x,
        top: sig.y,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        touchAction: "none",
      }}>
      {/* Nút kéo di chuyển */}
      <IconButton
        onPointerDown={handleMoveDown}
        size="small"
        sx={{
          width: 24,
          height: 24,
          position: "absolute",
          top: -12,
          left: -12,
          backgroundColor: "#1677ff",
          color: "white",
          zIndex: 110,
          "&:hover": { backgroundColor: "#006aff" },
          cursor: "move",
        }}>
        <PanTool sx={{ fontSize: 14 }} />
      </IconButton>

      {/* Nút xóa khung */}
      <IconButton
        onClick={() => onDelete(sig.id)}
        size="small"
        sx={{
          width: 24,
          height: 24,
          position: "absolute",
          top: -12,
          right: -12,
          backgroundColor: "#ff4d4f",
          color: "#fff",
          zIndex: 110,
        }}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>

      {/* Khung ký tên */}
      <Box
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          position: "relative", // Quan trọng để đặt handle resize
          border: "2px dashed #0B3C8A",
          borderRadius: 1,
          backgroundColor: "rgba(255,255,255,0.9)",
          boxShadow: dragging ? "0 8px 20px rgba(0,0,0,0.2)" : "none",
          transition: "box-shadow 0.2s",
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
              touchAction: "none",
            },
          }}
        />

        {/* VÙNG KÉO RỘNG SIÊU NHẠY */}
        <Box
          onPointerDown={handleResizeDown}
          sx={{
            position: "absolute",
            bottom: -10,
            right: -10,
            width: 45, // Vùng chạm rất lớn cho mobile
            height: 45,
            cursor: "nwse-resize",
            zIndex: 120,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "8px",
            // Chỉ thị hình ảnh cho người dùng biết chỗ kéo
            "&::after": {
              content: '""',
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "0 0 15px 15px",
              borderColor: "transparent transparent #0B3C8A transparent",
              opacity: 0.7,
            },
          }}
        />
      </Box>

      {/* Nhập Họ Tên */}
      <TextField
        size="small"
        placeholder="Họ tên người ký..."
        variant="outlined"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        sx={{
          width: dimensions.width,
          backgroundColor: "white",
          "& .MuiInputBase-input": {
            fontSize: "13px",
            padding: "6px",
            textAlign: "center",
            fontWeight: "bold",
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
