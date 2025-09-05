import React from 'react';
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import {
    Box,
    Paper,
    Typography
  } from "@mui/material"
export default function HeaderBVLNT() {
const [currentTime, setCurrentTime] = useState(() => new Date())
const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }, [])

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Image src={"/logo.png"} width={100} height={100} alt="Logo" />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#1976D2",
                mb: 0.5,
              }}
            >
              BỆNH VIỆN ĐA KHOA <Typography component="span" variant="h4" sx={{
                fontWeight: "bold",
                color: "#d21919ff",
              }}>LÊ NGỌC TÙNG</Typography>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#1976D2",
              fontFamily: "monospace",
            }}
          >
            {formatTime(currentTime)}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              mt: 0.5,
            }}
          >
            {formatDate(currentTime)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )}