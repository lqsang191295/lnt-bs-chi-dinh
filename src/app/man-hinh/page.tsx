"use client"

import type React from "react"
import {fetchCurrentQueueNumbers} from "@/actions/act_dangkykhambenh"
import HeaderBVLNT from "@/components/HeaderBVLNT"
import { useState, useEffect } from "react"
import { useRef, useLayoutEffect } from "react"
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
  // ref for scaling the whole content to fit the viewport
  const contentRef = useRef<HTMLDivElement | null>(null)

  // scale content so entire page fits in one viewport without scroll
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    const updateScale = () => {
      // reset transform to measure natural size
      el.style.transform = "scale(1)"
      const rect = el.getBoundingClientRect()
      const contentW = rect.width
      const contentH = rect.height
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      // keep a tiny margin so we never touch scrollbars
      const margin = 12
      const scale = Math.min(1, (viewportW - margin) / contentW, (viewportH - margin) / contentH)
      el.style.transformOrigin = "top center"
      el.style.transform = `scale(${scale})`
      // ensure container stays full viewport and prevents page scroll
      document.documentElement.style.height = "100%"
      document.body.style.height = "100%"
      document.body.style.overflow = "hidden"
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    return () => {
      window.removeEventListener("resize", updateScale)
      // restore overflow on unmount
      document.body.style.overflow = ""
      document.body.style.height = ""
      document.documentElement.style.height = ""
    }
  }, [queueData])



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


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E3F2FD 0%, #E8F5E8 100%)",
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        {/* content wrapper that will be scaled to fit viewport */}
        <div ref={contentRef}>
          <HeaderBVLNT />
          {/* Queue Display */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              // prevent internal scroll, we rely on scaling instead
              overflow: "hidden",
            }}
          >
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(135deg, #1976D2 0%, #4CAF50 100%)" }}>
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)",
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
                      fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)",
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
                      fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)",
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
                      // let row height be responsive but constrained so overall table stays compact
                      height: { xs: 84, sm: 100, md: 120 },
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
                            fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
                            height: { xs: 32, sm: 36, md: 40 },
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
                          fontSize: "clamp(1rem, 2.2vw, 1.6rem)",
                        }}
                      >
                        {queue.patientName}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#666",
                          fontWeight: "medium",
                          fontSize: "clamp(0.85rem, 1.6vw, 1.1rem)",
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
                          minWidth: { xs: 80, sm: 90, md: 100 },
                        }}
                      >
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: "bold",
                            color: queue.color,
                            fontFamily: "monospace",
                            fontSize: { xs: "2rem", sm: "2.6rem", md: "3rem" },
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
              <Grid size={{xs:12, md:4}}>
                <Box sx={{ textAlign: { xs: "left", md: "left" } }}>
                  <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                    Tổng đài: <Box component="span" sx={{ fontWeight: 900 }}>02763 797999</Box>
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{xs:12, md:4}}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                    Hotline: <Box component="span" sx={{ fontWeight: 900 }}>1900 561 510</Box>
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{xs:12, md:4}}>
                <Box sx={{ textAlign: { xs: "right", md: "right" } }}>
                  <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                    Cấp cứu: <Box component="span" sx={{ fontWeight: 900 }}>0888 79 52 59</Box>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </div>
      </Container>
    </Box>
  )
}
