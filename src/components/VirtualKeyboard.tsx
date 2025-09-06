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
  keyboardMode?: "text" | "numeric";
};

export default function VirtualKeyboard({
  visible,
  onClose,
  onTextChange,
  currentText,
  keyboardMode = "text"
}: VirtualKeyboardProps) {
  const [text, setText] = useState(currentText || "");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const offsetRef = useRef({ dx: 0, dy: 0 });
  const keyboardRef = useRef<HTMLDivElement>(null);
  const isNumeric = keyboardMode === "numeric";
  
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
  console.debug('[VK] keypress', { button, text });
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
      // nếu numeric mode, chỉ cho phép ký tự hợp lệ (số + dấu chấm/phẩy/plus/minus/space/paren)
      if (isNumeric) {
        const allowed = /^[0-9\.\,\+\-\s\(\)]$/;
        if (!allowed.test(button)) {
          return; // bỏ qua ký tự không hợp lệ
        }
        newText = text + button;
      } else {
  // text mode: append then try to compose Telex if appropriate
  newText = text + button;
  const composed = composeTelex(newText);
  console.debug('[VK] composeTelex', { before: newText, after: composed });
  newText = composed;
      }
    }

    setText(newText);
    onTextChange(newText);
  };

  // ------------------ Telex composition helpers ------------------
  const TONE_MAP: Record<string, number> = { s: 1, f: 2, r: 3, x: 4, j: 5 };

  const VOWEL_TONE_TABLE: Record<string, string[]> = {
    a: ["a","á","à","ả","ã","ạ"],
    ă: ["ă","ắ","ằ","ẳ","ẵ","ặ"],
    â: ["â","ấ","ầ","ẩ","ẫ","ậ"],
    e: ["e","é","è","ẻ","ẽ","ẹ"],
    ê: ["ê","ế","ề","ể","ễ","ệ"],
    i: ["i","í","ì","ỉ","ĩ","ị"],
    o: ["o","ó","ò","ỏ","õ","ọ"],
    ô: ["ô","ố","ồ","ổ","ỗ","ộ"],
    ơ: ["ơ","ớ","ờ","ở","ỡ","ợ"],
    u: ["u","ú","ù","ủ","ũ","ụ"],
    ư: ["ư","ứ","ừ","ử","ữ","ự"],
    y: ["y","ý","ỳ","ỷ","ỹ","ỵ"],
  };

  const VOWELS = Object.keys(VOWEL_TONE_TABLE);

  function applyToneToChar(ch: string, toneIndex: number): string {
    const lower = ch.toLowerCase();
    const table = VOWEL_TONE_TABLE[lower];
    if (!table) return ch;
    const toned = table[toneIndex] || table[0];
    // preserve case
    return ch === lower ? toned : toned.toUpperCase();
  }

  function replaceDiacriticVowel(token: string): string {
    // replace common Telex vowel modifiers first: aa->â, aw->ă, ee->ê, oo->ô, ow->ơ, uw->ư, dd->đ
    // prioritize double-letter forms
    const patterns: [RegExp, string][] = [
      [/dd/gi, "đ"],
      [/aa/gi, "â"],
      [/aw/gi, "ă"],
      [/ee/gi, "ê"],
      [/oo/gi, "ô"],
      [/ow/gi, "ơ"],
      [/uw/gi, "ư"],
    ];
    for (const [re, repl] of patterns) {
      if (re.test(token)) {
        token = token.replace(re, (m) => (m === m.toLowerCase() ? repl : repl.toUpperCase()));
        break; // only one modifier per token typically
      }
    }
    return token;
  }

  function composeTelex(fullText: string): string {
    // find last word-like token (letters and diacritics)
    const m = fullText.match(/([\p{L}0-9]+)$/u);
  if (!m) return fullText;
    const token = m[1];
    let transformed = token;

    // tone marker at end
    const lastChar = token.slice(-1).toLowerCase();
    let toneIndex: number | null = null;
    if (TONE_MAP[lastChar] !== undefined) {
      toneIndex = TONE_MAP[lastChar];
      transformed = token.slice(0, -1);
    }
    console.debug('[VK] composeTelex token/tone', { token, lastChar, toneIndex });

    // apply dd/aa/aw/ee/oo/ow/uw
    transformed = replaceDiacriticVowel(transformed);

    // if we had a tone marker, apply it to the main vowel
  if (toneIndex !== null) {
      // find vowel positions
      const chars = Array.from(transformed);
      // choose target vowel by priority order
      const priority = ["a","ă","â","e","ê","o","ô","ơ","u","ư","i","y"];
      let targetIdx = -1;
      for (const p of priority) {
        const idx = chars.findIndex(c => c.toLowerCase() === p);
        if (idx !== -1) { targetIdx = idx; break; }
      }
      if (targetIdx === -1) {
        // fallback to any vowel
        targetIdx = chars.findIndex(c => VOWELS.includes(c.toLowerCase()));
      }
      if (targetIdx !== -1) {
        const orig = chars[targetIdx];
        const newChar = applyToneToChar(orig, toneIndex);
        chars[targetIdx] = newChar;
        transformed = chars.join("");
        console.debug('[VK] applied tone', { orig, newChar, targetIdx, transformed });
      }
    }

    // if replaceDiacriticVowel changed letters and token ended with tone marker that we consumed, we already updated
    // Put transformed token back into fullText
    return fullText.slice(0, fullText.length - token.length) + transformed;
  }

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
        minWidth: isNumeric ? 420 : 800,
        maxWidth: isNumeric ? 700 : 1200,
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

      {/* Nếu numeric -> chỉ render numeric layout, còn không render full layout */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {isNumeric ? (
          <Grid size={{xs:12}}>
            <Keyboard
              onKeyPress={handleKeyPress}
              layout={{
                default: [
                  "1 2 3",
                  "4 5 6",
                  "7 8 9",
                  "0 {bksp} {clear}"
                ]
              }}
              display={{
                "{bksp}": "⌫",
                "{clear}": "Clear",
              }}
              buttonTheme={[
                { class: "hg-num", buttons: "1 2 3 4 5 6 7 8 9 0" },
                { class: "hg-bksp", buttons: "{bksp}" },
              ]}
              theme="hg-theme-default hg-layout-default"
              physicalKeyboardHighlight={false}
              physicalKeyboardHighlightTextColor="#000"
              physicalKeyboardHighlightBgColor="#f0f0f0"
            />
          </Grid>
        ) : (
          <>
            <Grid size={{xs:8}}>
              <Keyboard
                onKeyPress={handleKeyPress}
                layout={{
                  default: [
                    "q w e r t y u i o p {bksp}",
                    "a s d f g h j k l",
                    "z x c v b n m , . {clear}",
                    "{space}"
                  ]
                }}
                display={{
                  "{bksp}": "⌫",
                  "{space}": "Space",
                  "{clear}": "Clear",
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
            <Grid size={{xs:4}}>
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
          </>
        )}
      </Grid>

      {/* CSS tùy chỉnh cho bàn phím */}
      <style jsx global>{`
        .simple-keyboard {
          background: transparent !important;
        }
        .hg-num .hg-button {
          min-height: 70px !important;
          font-size: 1.25rem !important;
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
