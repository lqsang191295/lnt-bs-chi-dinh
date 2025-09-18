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

  // Close on click outside
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
    if (visible) onClose();
  }, visible);

  // Sync external text
  useEffect(() => {
    setText(currentText || "");
  }, [currentText]);

  // Reset on show
  useEffect(() => {
    if (visible) handleReset();
  }, [visible]);

  // ------------------ Telex composition helpers ------------------
  // s: sắc, f: huyền, r: hỏi, x: ngã, j: nặng, z: bỏ dấu
  const TONE_MAP: Record<string, number | "remove"> = {
    s: 1, f: 2, r: 3, x: 4, j: 5, z: "remove"
  };

  // tone order: [none, sắc, huyền, hỏi, ngã, nặng]
  const VOWEL_TONE_TABLE: Record<string, string[]> = {
    "a": ["a", "á", "à", "ả", "ã", "ạ"],
    "ă": ["ă", "ắ", "ằ", "ẳ", "ẵ", "ặ"],
    "â": ["â", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
    "e": ["e", "é", "è", "ẻ", "ẽ", "ẹ"],
    "ê": ["ê", "ế", "ề", "ể", "ễ", "ệ"],
    "i": ["i", "í", "ì", "ỉ", "ĩ", "ị"],
    "o": ["o", "ó", "ò", "ỏ", "õ", "ọ"],
    "ô": ["ô", "ố", "ồ", "ổ", "ỗ", "ộ"],
    "ơ": ["ơ", "ớ", "ờ", "ở", "ỡ", "ợ"],
    "u": ["u", "ú", "ù", "ủ", "ũ", "ụ"],
    "ư": ["ư", "ứ", "ừ", "ử", "ữ", "ự"],
    "y": ["y", "ý", "ỳ", "ỷ", "ỹ", "ỵ"],
    "đ": ["đ", "đ", "đ", "đ", "đ", "đ"] // tiện cho tra cứu
  };
  const VOWELS = Object.keys(VOWEL_TONE_TABLE);

  function applyToneToChar(ch: string, toneIndex: number): string {
    const lower = ch.toLowerCase();
    const table = VOWEL_TONE_TABLE[lower];
    if (!table) return ch;
    const toned = table[toneIndex] || table[0];
    return ch === lower ? toned : toned.toUpperCase();
  }

  function removeToneFromChar(ch: string): string {
    const lower = ch.toLowerCase();
    for (const key of Object.keys(VOWEL_TONE_TABLE)) {
      const idx = VOWEL_TONE_TABLE[key].indexOf(lower);
      if (idx >= 0) {
        const base = VOWEL_TONE_TABLE[key][0];
        return ch === lower ? base : base.toUpperCase();
      }
    }
    return ch;
  }

  // Replace Telex base forms before tone: aa/aw/ee/oo/ow/uw/dd
  function replaceDiacriticVowel(token: string): string {
    const patterns: [RegExp, string][] = [
      [/dd/g, "đ"], [/DD/g, "Đ"],
      [/aa/g, "â"], [/AA/g, "Â"],
      [/aw/g, "ă"], [/AW/g, "Ă"],
      [/ee/g, "ê"], [/EE/g, "Ê"],
      [/oo/g, "ô"], [/OO/g, "Ô"],
      [/ow/g, "ơ"], [/OW/g, "Ơ"],
      [/uw/g, "ư"], [/UW/g, "Ư"]
    ];
    for (const [re, repl] of patterns) {
      if (re.test(token)) {
        token = token.replace(re, repl);
      }
    }
    return token;
  }

    function findLastVowelIndex(chars: string[]): number {
  for (let i = chars.length - 1; i >= 0; i--) {
    if (VOWELS.includes(chars[i].toLowerCase())) {
      return i;
    }
  }
  return -1;
}


  function stripToneFromToken(token: string): string {
    const chars = Array.from(token);
    // remove tone from the prioritized vowel
    const idx = findLastVowelIndex(chars);
    if (idx !== -1) {
      chars[idx] = removeToneFromChar(chars[idx]);
    }
    return chars.join("");
  }

  // Compose text with Telex when typing at the end of a word
  function composeTelex(fullText: string): string {
  const m = fullText.match(/([\p{L}0-9]+)$/u);
  if (!m) return fullText;

  let token = m[1];
  let action: number | "remove" | null = null;

  const lastLower = token.slice(-1).toLowerCase();
  if (TONE_MAP[lastLower] !== undefined) {
    const hasVowelBefore = Array.from(token.slice(0, -1))
      .some(c => VOWELS.includes(c.toLowerCase()));
    if (hasVowelBefore) {
      action = TONE_MAP[lastLower];
      token = token.slice(0, -1);
    }
  }

  // Bước 1: thay tổ hợp trước
  token = replaceDiacriticVowel(token);

  // Bước 2: áp dấu
  if (action === "remove") {
    token = stripToneFromToken(token);
  } else if (typeof action === "number") {
    const chars = Array.from(token);
    const targetIdx = findLastVowelIndex(chars); // tìm nguyên âm cuối
    if (targetIdx !== -1) {
      chars[targetIdx] = applyToneToChar(chars[targetIdx], action);
    }
    token = chars.join("");
  }

  return fullText.slice(0, fullText.length - m[1].length) + token;
}

  // ------------------ Input handling ------------------
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
      if (isNumeric) {
        const allowed = /^[0-9\.\,\+\-\s\(\)]$/;
        if (!allowed.test(button)) return;
        newText = text + button;
      } else {
        // Keyboard layout is uppercase, but we must feed lowercase letters to Telex logic
        const isSingleLetter = /^[A-Z]$/.test(button);
        const normalized = isSingleLetter ? button.toLowerCase() : button.toLowerCase(); // tone keys S/F/R/X/J/Z also normalized
        newText = composeTelex(text + normalized);
      }
    }

    setText(newText);
    onTextChange(newText);
  };

  // ------------------ Drag/zoom ------------------
  const handleMouseDown = (e: React.MouseEvent) => {
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

    const keyboardWidth = keyboardRef.current?.offsetWidth || 800;
    const keyboardHeight = keyboardRef.current?.offsetHeight || 400;
    const maxX = window.innerWidth - keyboardWidth;
    const maxY = window.innerHeight - keyboardHeight;

    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [dragging]);

  const handleMouseUp = () => setDragging(false);

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

    const keyboardWidth = keyboardRef.current?.offsetWidth || 800;
    const keyboardHeight = keyboardRef.current?.offsetHeight || 400;
    const maxX = window.innerWidth - keyboardWidth;
    const maxY = window.innerHeight - keyboardHeight;

    setPos({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [dragging]);

  const handleTouchEnd = () => setDragging(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const handleReset = () => {
    const keyboardWidth = 800;
    const keyboardHeight = 450;
    const x = (window.innerWidth / 2) - (keyboardWidth / 2);
    const y = window.innerHeight - keyboardHeight;
    setPos({ x: Math.max(0, x), y: Math.max(0, y) });
    setScale(1);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
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
      {/* Header */}
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
          "&:active": { cursor: "grabbing" },
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
            sx={{ color: "white", "&:hover": { background: "rgba(255,255,255,0.1)" }, p: 0.5 }}
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
            sx={{ color: "white", "&:hover": { background: "rgba(255,255,255,0.1)" }, p: 0.5 }}
          >
            <ZoomIn sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{ color: "white", "&:hover": { color: "#fecaca", background: "rgba(255,255,255,0.1)" }, p: 0.5 }}
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

      {/* Keyboard */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {isNumeric ? (
          <Grid size={{ xs: 12 }}>
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
                "{clear}": "CLEAR",
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
            <Grid size={{ xs: 8 }}>
              <Keyboard
                onKeyPress={handleKeyPress}
                layout={{
                  default: [
                    "Q W E R T Y U I O P {bksp}",
                    "A S D F G H J K L",
                    "Z X C V B N M , . {clear}",
                    "{space}"
                  ]
                }}
                display={{
                  "{bksp}": "⌫",
                  "{space}": "SPACE",
                  "{clear}": "CLEAR",
                }}
                buttonTheme={[
                  { class: "hg-spacebar", buttons: "{space}" },
                  { class: "hg-enter", buttons: "{enter}" }
                ]}
                theme="hg-theme-default hg-layout-default"
                physicalKeyboardHighlight={false}
                physicalKeyboardHighlightTextColor="#000"
                physicalKeyboardHighlightBgColor="#f0f0f0"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
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

      {/* Custom styles */}
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
          font-weight: 700 !important;
          font-size: 1rem !important;
          min-height: 50px !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          text-transform: uppercase !important; /* ensure uppercase labels */
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
