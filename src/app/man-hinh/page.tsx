"use client"

import type React from "react"
import Image from "next/image"
import {fetchCurrentQueueNumbers} from "@/actions/act_dangkykhambenh"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
} from "@mui/material"
import { LocalHospital, HealthAndSafety, MedicalServices } from "@mui/icons-material"

interface QueueData {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  currentNumber: number
  patientName: string
  birthYear?: number
}

export default function QueueDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Mock data for queue numbers - in real app this would come from API
  const [queueData, setQueueData] = useState<QueueData[]>([
    {
      id: "bhyt",
      title: "Quầy khám BHYT",
      icon: <LocalHospital sx={{ fontSize: 24 }} />,
      color: "#2196F3",
      currentNumber: 0,
      patientName: "",
    },
    {
      id: "dv",
      title: "Quầy khám Dịch vụ",
      icon: <MedicalServices sx={{ fontSize: 24 }} />,
      color: "#4CAF50",
      currentNumber: 0,
      patientName: "",
    },
    {
      id: "ksk",
      title: "Quầy khám sức khỏe",
      icon: <HealthAndSafety sx={{ fontSize: 24 }} />,
      color: "#FF9800",
      currentNumber: 0,
      patientName: "",
    },
  ])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate queue number updates
  useEffect(() => {
    const loadQueueNumbers = async () => {
      try {
        const respone = await fetchCurrentQueueNumbers();
        const data = respone.data || [];
        //Update queueData based on fetched data
        setQueueData((prev) =>
          prev.map((queue) => {
            const updatedQueue = data.find((d) => d.MaQuay === queue.id);
            return updatedQueue ? { 
              ...queue, currentNumber: updatedQueue.STT, patientName: updatedQueue.Hoten, birthYear: updatedQueue.NamSinh
            } : queue;
          })
        );
      } catch (error) {
        console.error("Error fetching queue numbers:", error);
      }
    }
    const interval = setInterval(() => {
      loadQueueNumbers();
    }, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E3F2FD 0%, #E8F5E8 100%)",
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
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
                  Bệnh viện Đa khoa <Typography component="span" variant="h4" sx={{
                    fontWeight: "bold",
                    color: "#d21919ff",
                  }}>Lê Ngọc Tùng</Typography>
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
        {/* Queue Display */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow sx={{ background: "linear-gradient(135deg, #1976D2 0%, #4CAF50 100%)" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  QUẦY ĐĂNG KÝ
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  HỌ TÊN - NĂM SINH
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  SỐ THỨ TỰ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queueData.map((queue) => (
                <TableRow
                  key={queue.id}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: `${queue.color}08`,
                    },
                    height: 120,
                  }}
                >
                  {/* Queue Column */}
                  <TableCell sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <Box sx={{ color: queue.color }}>{queue.icon}</Box>
                      <Chip
                        label={queue.title}
                        sx={{
                          background: `linear-gradient(135deg, ${queue.color}20 0%, ${queue.color}30 100%)`,
                          color: queue.color,
                          fontWeight: "bold",
                          fontSize: "1rem",
                          height: 40,
                          border: `2px solid ${queue.color}40`,
                        }}
                      />
                    </Box>
                  </TableCell>

                  {/* Patient Name and Birth Year Column */}
                  <TableCell sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "#333",
                        mb: 1,
                      }}
                    >
                      {queue.patientName}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#666",
                        fontWeight: "medium",
                      }}
                    >
                      Năm sinh: {queue.birthYear}
                    </Typography>
                  </TableCell>

                  {/* Current Number Column */}
                  <TableCell sx={{ textAlign: "center", py: 4 }}>
                    <Paper
                      elevation={3}
                      sx={{
                        display: "inline-block",
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${queue.color}15 0%, ${queue.color}25 100%)`,
                        border: `3px solid ${queue.color}`,
                        minWidth: 100,
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: "bold",
                          color: queue.color,
                          fontFamily: "monospace",
                          fontSize: "3rem",
                          lineHeight: 1,
                        }}
                      >
                        {queue.currentNumber.toString().padStart(2, "0")}
                      </Typography>
                    </Paper>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Contact Three Columns */}
        <Paper
          elevation={2}
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={4}>
              <Box sx={{ textAlign: { xs: "left", md: "left" } }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold" }}>
                  Tổng đài: 02763 797999
                </Typography>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold" }}>
                  Hotline: 900 561 510
                </Typography>
              </Box>
            </Grid>
            <Grid size={4}>
              <Box sx={{ textAlign: { xs: "right", md: "right" } }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold" }}>
                  Cấp cứu: 0888 79 52 59
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}
