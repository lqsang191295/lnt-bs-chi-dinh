"use client"

import type { JSX } from "react"
import {fetchCurrentQueueNumbers, getDM_QuayDangKy} from "@/actions/act_dangkykhambenh"
import HeaderBVLNT from "@/components/HeaderBVLNT"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Container,
  Paper,
  Chip,
} from "@mui/material"
import { LocalHospital, HealthAndSafety, MedicalServices } from "@mui/icons-material"

interface QueueData {
  id: string
  title: string
  icon: string
  color: string
  currentNumber: number
  patientName: string
  birthYear?: number
}

export default function QueueDisplayPage() {
  const iconMap: Record<string, JSX.Element> = {
  LocalHospital: <LocalHospital sx={{ fontSize: 18, color: "#2196F3" }} />,
  MedicalServices: <MedicalServices sx={{ fontSize: 18, color: "#4CAF50" }} />,
  HealthAndSafety: <HealthAndSafety sx={{ fontSize: 18, color: "#FF9800" }} />,
};
  const [queueData, setQueueData] = useState<QueueData[]>([])
  useEffect(() => {
    const DM_Quay = async () => {
      try {
        const respone = await getDM_QuayDangKy();
        respone.forEach((item) => {
          setQueueData(prev => [
            ...prev,
            {
              id: item.Ma,
              title: item.TenQuay,
              icon: item.Icon,
              color: item.Color,
              currentNumber: 0,
              patientName: "",
            } as QueueData,
          ]);
        });
      } catch (error) {
        console.error("Error loading DM_QuayDangKy:", error);
      }
    };
    DM_Quay();
  }, [])
  // Simulate queue number updates
  useEffect(() => {
    const loadQueueNumbers = async () => {
      try {
        const respone = await fetchCurrentQueueNumbers();
        const data = respone?.data || [];

        // Build a lookup for fetched items
        type FetchedItem = { MaQuay?: string; STT?: number; Hoten?: string; NamSinh?: number };
        const fetchedMap = new Map<string, FetchedItem>();
        (data as unknown[]).forEach((d) => {
          if (d && typeof d === "object" && "MaQuay" in d) {
            const it = d as FetchedItem;
            if (it.MaQuay) fetchedMap.set(it.MaQuay, it);
          }
        });

        // Only update state when a real change is detected to avoid unnecessary re-renders
        setQueueData((prev) => {
          let changed = false;
          const next = prev.map((queue) => {
            const updated = fetchedMap.get(queue.id);
            if (!updated) return queue;
            const newQ = {
              ...queue,
              currentNumber: (updated.STT ?? queue.currentNumber) as number,
              patientName: (updated.Hoten ?? queue.patientName) as string,
              birthYear: (updated.NamSinh ?? queue.birthYear) as number | undefined,
            };
            if (
              newQ.currentNumber !== queue.currentNumber ||
              newQ.patientName !== queue.patientName ||
              newQ.birthYear !== queue.birthYear
            ) {
              changed = true;
            }
            return newQ;
          });

          return changed ? next : prev;
        });
      } catch (error) {
        console.error("Error fetching queue numbers:", error);
      }
    };
    const interval = setInterval(() => {
      loadQueueNumbers();
    }, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])


  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #E3F2FD 0%, #E8F5E8 100%)",
        py: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 2,
          px: { xs: 1, md: 3 },
        }}
      >
        {/* header 10% */}
        <Box sx={{ flex: "0 0 10vh", display: "flex", alignItems: "center" }}>
          <HeaderBVLNT />
        </Box>

        {/* main content 80%: render all queues in a responsive 2-column grid */}
        <Box sx={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              height: "100%",
            }}
          >            
            {queueData.map((queue) => (
              <Paper
                key={queue.id}
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 3,
                  background: "rgba(255,255,255,0.95)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                  <Chip
                    icon={iconMap[queue.icon]}
                    label={queue.title}
                    sx={{
                      "& .MuiChip-icon": { color: "inherit !important" },
                      background: `linear-gradient(135deg, ${queue.color}20 0%, ${queue.color}30 100%)`,
                      color: queue.color,
                      fontWeight: "bold",
                      fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
                      height: { xs: 32, sm: 36, md: 40 },
                      border: `2px solid ${queue.color}40`,
                    }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap variant="body1" sx={{ fontWeight: "bold", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{queue.patientName}</Typography>
                    {/* <Typography variant="body2" sx={{ color: "#666", fontWeight: "medium" }}>{queue.birthYear}</Typography> */}
                  </Box>
                </Box>

                <Box sx={{ flex: "0 0 auto", ml: "auto" }}>
                  <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, minWidth: 80, textAlign: "center", background: `linear-gradient(135deg, ${queue.color}15 0%, ${queue.color}25 100%)`, border: `3px solid ${queue.color}` }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: queue.color, fontFamily: "monospace", lineHeight: 1 }}>{queue.currentNumber.toString().padStart(3, "0")}</Typography>
                  </Paper>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* footer 10% */}
        <Box sx={{ flex: "0 0 10vh", display: "flex", alignItems: "center" }}>
          <Paper
            elevation={2}
            sx={{
              width: "100%",
              p: 2,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ textAlign: "left", flex: "1 1 33%" }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                  Tổng đài: <Box component="span" sx={{ fontWeight: 900 }}>02763 797999</Box>
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center", flex: "1 1 33%" }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                  Hotline: <Box component="span" sx={{ fontWeight: 900 }}>1900 561 510</Box>
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right", flex: "1 1 33%" }}>
                <Typography variant="h6" sx={{ color: "#1976D2", fontWeight: "bold", fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}>
                  Cấp cứu: <Box component="span" sx={{ fontWeight: 900 }}>0888 79 52 59</Box>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}
