import React from 'react';
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { keyframes } from "@emotion/react"
import {
    Box,
    Paper,
    Typography
  } from "@mui/material"
export default function HeaderBVLNT() {
  const items = ["Tổng đài: 02763 797 999", "Cấp cứu: 0888 79 52 59"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    // Cứ 10 giây đổi index
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 10000); // 10000ms = 10 giây

    // Clear interval khi component unmount
    return () => clearInterval(interval);
  }, [items.length]);
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }, [])


  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prevTime => {
        const now = new Date()
        // Chỉ update nếu giây thay đổi để tránh re-render không cần thiết
        if (now.getSeconds() !== prevTime.getSeconds()) {
          return now
        }
        return prevTime
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        flex: 1
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Image loading="eager" src={"/logo.png"} width={100} height={100} alt="Logo" />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#354b9c",
                mb: 0.5,
                fontSize: "clamp(1.4rem, 1.8vw, 1.1rem)"
              }}
            >
              BỆNH VIỆN ĐA KHOA <Typography component="span" variant="h4" sx={{
                fontWeight: "bold",
                color: "#354b9c",
                fontSize: "clamp(1.4rem, 1.8vw, 1.1rem)"
              }}>LÊ NGỌC TÙNG</Typography>
            </Typography>
            <Typography
              fontSize={14}
              sx={{
                color: "#354b9c",
              }}
            >
              Địa chỉ: 500 CMT8, KP.3, Phường Tân Ninh, Tây Ninh. <br/>              
            </Typography>
            <Typography fontSize={14}
              sx={{
                color: "#354b9c",
                fontStyle: "italic"
              }}>Tel: 066.3 797 999 - Hotline: 1900 561 510 </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography
          suppressHydrationWarning
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#354b9c",
              fontFamily: "monospace",
            }}
          >
            
            {formatTime(currentTime)}
          </Typography>
          {/** animated rotating contact line */}
          <Box
            key={index}
            component={Typography}
            suppressHydrationWarning
            variant="body1"
            sx={{
              color: "#1976D2",
              mt: 0.5,
              animation: `${slideFadeIn} 1000ms ease`,
              transformOrigin: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {items[index]}
          </Box>
        </Box>
      </Box>
    </Paper>
  )}

const slideFadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`