"use client";
import React, { useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { Grid, Box, IconButton } from "@mui/material";
import { Close, Keyboard as KeyboardIcon, DragIndicator, ZoomIn, ZoomOut } from "@mui/icons-material";
import { useClickOutside } from "@/utils/useClickOutside";

type VirtualKeyboardProps = {
  visible: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  currentText: string;
};

export default function VirtualKeyboard({ 
  visible, 
  onClose, 
  onTextChange, 
  currentText 
}: VirtualKeyboardProps) {
  const [text, setText] = useState(currentText || "");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const offsetRef = useRef({ dx: 0, dy: 0 });
  const keyboardRef = useRef<HTMLDivElement>(null);
  
  // Sử dụng click outside để đóng bàn phím
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
    if (visible) {
      onClose();
    }
  }, visible);

  // Cập nhật text khi currentText thay đổi từ bên ngoài
  useEffect(() => {
    setText(currentText || "");
  }, [currentText]);

  // Reset position và scale khi bàn phím được hiển thị
  useEffect(() => {
    if (visible) {
      handleReset();
    }
  }, [visible]);

  const handleKeyPress = (button: string) => {
    let newText = text;
    
    if (button === "{bksp}") {
      newText = text.slice(0, -1);
    } else if (button === "{space}") {
      newText = text + " ";
    } else if (button === "{clear}") {
      newText = "";
    } else if (button === "{enter}") {
      onClose();
      return;
    } else {
      newText = text + button;
    }
    setText(newText);
    onTextChange(newText);
  };

  // Mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Cho phép drag khi click vào header hoặc các element con của header
    const target = e.target as HTMLElement;
    const header = target.closest('[data-drag-handle="true"]');
    if (header) {
      e.preventDefault();
      setDragging(true);
      offsetRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    }
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const newX = e.clientX - offsetRef.current.dx;
    const newY = e.clientY - offsetRef.current.dy;
    
    // Giới hạn bàn phím trong viewport
    const keyboardWidth = keyboardRef.current?.offsetWidth || 800;
    const keyboardHeight = keyboardRef.current?.offsetHeight || 400;
    const maxX = window.innerWidth - keyboardWidth;
    const maxY = window.innerHeight - keyboardHeight;
    
    setPos({ 
      x: Math.max(0, Math.min(newX, maxX)), 
      y: Math.max(0, Math.min(newY, maxY)) 
    });
  }, [dragging]);

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const header = target.closest('[data-drag-handle="true"]');
    if (header) {
      e.preventDefault();
      const t = e.touches[0];
      setDragging(true);
      offsetRef.current = { dx: t.clientX - pos.x, dy: t.clientY - pos.y };
    }
  };

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const newX = t.clientX - offsetRef.current.dx;
    const newY = t.clientY - offsetRef.current.dy;
    
    // Giới hạn bàn phím trong viewport
    const keyboardWidth = keyboardRef.current?.offsetWidth || 800;
    const keyboardHeight = keyboardRef.current?.offsetHeight || 400;
    const maxX = window.innerWidth - keyboardWidth;
    const maxY = window.innerHeight - keyboardHeight;
    
    setPos({ 
      x: Math.max(0, Math.min(newX, maxX)), 
      y: Math.max(0, Math.min(newY, maxY)) 
    });
  }, [dragging]);

  const handleTouchEnd = () => {
    setDragging(false);
  };

  // Zoom functions
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Reset position and scale
  const handleReset = () => {
    // Tính toán vị trí để bàn phím ở bottom: 0 và left: 50%
    const keyboardWidth = 800; // minWidth của bàn phím
    const keyboardHeight = 450; // estimated height
    const x = (window.innerWidth / 2) - (keyboardWidth / 2); // left: 50%
    const y = window.innerHeight - keyboardHeight; // bottom: 0
    
    setPos({ x: Math.max(0, x), y: Math.max(0, y) });
    setScale(1);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, handleMouseMove, handleTouchMove]);

  if (!visible) return null;

  return (
    <Box
      ref={(node) => {
        keyboardRef.current = node as HTMLDivElement | null;
        clickOutsideRef.current = node as HTMLDivElement | null;
      }}
      sx={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 1000,
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        border: "3px solid #2563eb",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        transition: dragging ? "none" : "transform 0.2s ease",
        minWidth: 800,
        maxWidth: 1200,
        cursor: dragging ? "grabbing" : "default",
      }}
    >
      {/* Header với các nút điều khiển */}
      <Box
        data-drag-handle="true"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "white",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          cursor: "grab",
          "&:active": {
            cursor: "grabbing",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DragIndicator sx={{ fontSize: 20 }} />
          <KeyboardIcon sx={{ fontSize: 20 }} />
          <Box sx={{ fontSize: "1rem", fontWeight: 600 }}>
            Bàn phím ảo
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleZoomOut}
            sx={{
              color: "white",
              "&:hover": { background: "rgba(255,255,255,0.1)" },
              p: 0.5,
            }}
          >
            <ZoomOut sx={{ fontSize: 18 }} />
          </IconButton>
          
          <Box sx={{ 
            fontSize: "0.8rem", 
            minWidth: 30, 
            textAlign: "center",
            background: "rgba(255,255,255,0.2)",
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}>
            {Math.round(scale * 100)}%
          </Box>
          
          <IconButton
            onClick={handleZoomIn}
            sx={{
              color: "white",
              "&:hover": { background: "rgba(255,255,255,0.1)" },
              p: 0.5,
            }}
          >
            <ZoomIn sx={{ fontSize: 18 }} />
          </IconButton>

          {/* <IconButton
            onClick={handleReset}
            sx={{
              color: "white",
              "&:hover": { background: "rgba(255,255,255,0.1)" },
              p: 0.5,
              fontSize: "0.7rem",
            }}
          >
            Reset
          </IconButton> */}

          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              "&:hover": { color: "#fecaca", background: "rgba(255,255,255,0.1)" },
              p: 0.5,
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Text preview */}
      <Box
        sx={{
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: 2,
          p: 2,
          m: 2,
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          fontSize: "1.1rem",
          color: "#1e293b",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
        }}
      >
        {text || "Văn bản sẽ hiển thị ở đây..."}
      </Box>

      {/* Bàn phím */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {/* Bàn phím chữ */}
        <Grid size={8}>
          <Keyboard
            onKeyPress={handleKeyPress}
            layout={{
              default: [
                "q w e r t y u i o p {bksp}",
                "a s d f g h j k l",
                "z x c v b n m , . {clear}",
                "{space} {enter}"
              ]
            }}
            display={{
              "{bksp}": "⌫",
              "{space}": "Space",
              "{clear}": "Clear",
              "{enter}": "Enter"
            }}
            buttonTheme={[
              {
                class: "hg-spacebar",
                buttons: "{space}"
              },
              {
                class: "hg-enter",
                buttons: "{enter}"
              }
            ]}
            theme="hg-theme-default hg-layout-default"
            physicalKeyboardHighlight={false}
            physicalKeyboardHighlightTextColor="#000"
            physicalKeyboardHighlightBgColor="#f0f0f0"
          />
        </Grid>

        {/* Bàn phím số */}
        <Grid size={4}>
          <Keyboard
            onKeyPress={handleKeyPress}
            layout={{
              default: [
                "1 2 3",
                "4 5 6", 
                "7 8 9",
                "0"
              ]
            }}
            theme="hg-theme-default hg-layout-default"
            physicalKeyboardHighlight={false}
            physicalKeyboardHighlightTextColor="#000"
            physicalKeyboardHighlightBgColor="#f0f0f0"
          />
        </Grid>
      </Grid>

      {/* CSS tùy chỉnh cho bàn phím */}
      <style jsx global>{`
        .simple-keyboard {
          background: transparent !important;
        }
        .simple-keyboard .hg-button {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 8px !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          min-height: 50px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        .simple-keyboard .hg-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: white !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
        }
        .simple-keyboard .hg-button:active {
          transform: translateY(0) !important;
        }
        .hg-spacebar {
          min-width: 200px !important;
        }
        .hg-enter {
          background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
          color: white !important;
        }
        .hg-enter:hover {
          background: linear-gradient(135deg, #047857 0%, #065f46 100%) !important;
        }
      `}</style>
    </Box>
  );
}
