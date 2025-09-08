"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Fade,
  Grow,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useQueue } from "@/hooks/ListPatientWaiting";
const queryClient = new QueryClient();
function QueueComponent({ maQuay }: { maQuay: string }) {
  const [animationKey, setAnimationKey] = useState(0)
  const { currentPatient, queueList, isLoading, error } = useQueue(maQuay);

  useEffect(() => {
    if (currentPatient) {
      setAnimationKey((prev) => prev + currentPatient.STT);
    }
  }, [currentPatient]);
  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải dữ liệu</p>;

  return (
     <Grid
        container
        spacing={0.5}
        sx={{
            height: "100vh",
            alignItems: "stretch",
        }}
        >
        {/* Bên trái - Thông tin khách hàng hiện tại */}
        <Grid size={{xs: 7, lg: 8}}>
            <Card
            elevation={3}
            sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.paper",
            }}
            
            >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Fade in={true} key={`number-${animationKey}`} timeout={800}>
                <Typography
                    variant="h1"
                    component="div"
                    sx={{
                    color: "primary.main",
                    mb: 3,
                    fontWeight: "bold",
                    fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
                    textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                    className="animate-pulse-custom"
                >
                    {currentPatient?.STT.toString().padStart(3, "0")}
                </Typography>
                </Fade>

                <Grow in={true} key={`name-${animationKey}`} timeout={1000}>
                <Typography
                    variant="h2"
                    component="div"
                    sx={{
                    color: "text.primary",
                    mb: 2,
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                    fontWeight: 600,
                    fontFamily: "sans-serif"
                    }}
                >
                    {currentPatient?.Hoten}
                </Typography>
                </Grow>

                <Fade in={true} key={`year-${animationKey}`} timeout={1200}>
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                    color: "text.secondary",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    fontWeight: 500,
                    }}
                >
                    {currentPatient?.NamSinh}
                </Typography>
                </Fade>
            </CardContent>
            </Card>
        </Grid>

        {/* Bên phải - Danh sách chờ */}
        <Grid size={{xs: 5, lg: 4}} >
            <Card
            elevation={3}
            sx={{
                height: "100%",
            //   borderRadius: 3,
                overflow: "hidden",
            }}
            >
            <CardContent sx={{ p: 0, height: "100%" }}>
                <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    height: "100%",
                    backgroundColor: "background.paper",
                }}
                >
                <Table stickyHeader>
                    <TableHead>
                    <TableRow>
                        <TableCell
                        align="center"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                        >
                        STT
                        </TableCell>
                        <TableCell
                        align="center"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                        >
                        Họ Tên
                        </TableCell>
                        <TableCell
                        align="center"
                        sx={{
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                        >
                        Năm Sinh
                        </TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {queueList.map((item, index) => (
                        <Fade in={true} key={`${item.STT}-${animationKey}`} timeout={300 + index * 100}>
                        <TableRow
                            className="animate-fade-in"
                            sx={{
                            "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                            },
                            }}
                        >
                            <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                                fontWeight: 600,
                                color: "secondary.main",
                            }}
                            >
                            {item.STT.toString().padStart(3, "0")}
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: "1rem", sm: "1.2rem" },
                                fontWeight: 500,
                            }}
                            >
                            {item.Hoten}
                            </TableCell>
                            <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: "1rem", sm: "1.2rem" },
                                color: "text.secondary",
                            }}
                            >
                            {item.NamSinh}
                            </TableCell>
                        </TableRow>
                        </Fade>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            </CardContent>
            </Card>
        </Grid>
    </Grid>
  );
}
// Tạo theme MUI tùy chỉnh
const theme = createTheme({
  palette: {
    primary: {
      main: "#354b9c",
    },
    secondary: {
      main: "#1976D2",
    },
    background: {
      default: "#ffffff",
      paper: "#f9fafb",
    },
    text: {
      primary: "#4b5563",
      secondary: "#374151",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "8rem",
      lineHeight: 1,
    },
    h2: {
      fontWeight: 600,
      fontSize: "3rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #e5e7eb",
          padding: "16px",
        },
        head: {
          backgroundColor: "#f9fafb",
          fontWeight: 600,
          fontSize: "1.1rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f3f4f6",
            transition: "background-color 0.2s ease",
          },
        },
      },
    },
  },
})

export default function QueueDisplay() {
  const params = useParams();
  const maQuays = params?.maQuay || "";
  const maQuay = Array.isArray(maQuays) ? maQuays[0] : maQuays;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
    <QueryClientProvider client={queryClient}>
      <QueueComponent maQuay={maQuay} />
    </QueryClientProvider>
      </Box>
    </ThemeProvider>
  )
}
