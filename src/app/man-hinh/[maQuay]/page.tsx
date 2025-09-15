"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent,
  Fade,
  CardHeader,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useQueue } from "@/hooks/ListPatientWaiting";
const queryClient = new QueryClient();
function QueueComponent({ maQuay }: { maQuay: string }) {
  const { currentPatient, queueList, isLoading, error } = useQueue(maQuay);

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
        {/* Bên trái - Thông tin bệnh nhân hiện tại */}
        <Grid size={{xs: 9, lg: 9}}>
            <Card
            elevation={3}
            sx={{
                height: "70%",
                maxHeight: "70vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
            }}           
            >
            <CardHeader
              title="SỐ ĐANG GỌI"
              sx={{ color: "white", bgcolor: "primary.main", textAlign: "center", maxHeight:"20px"}}
              slotProps={{
                title: {
                  sx: { fontSize: "20", fontWeight: "bold", fontFamily:"sans-serif"}
                }
              }}
            />
            <CardContent sx={{flex:1, display: "flex", textAlign: "center", alignItems: "center",justifyContent: "center"  }}>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    height: "100%",
                    backgroundColor: "background.paper",
                }}
                >
                <Table stickyHeader>
                    <TableBody>
                    {currentPatient.map((item, index) => (
                        <Fade in={true} key={item.STT} timeout={300 + index * 100}>
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
                                fontSize: { xs: "1.4rem", sm: "1.6rem" },
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                            >
                            {item.STT.toString().padStart(3, "0")}. {item.Hoten} - {item.NamSinh}
                            </TableCell>
                        </TableRow>
                        </Fade>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            </CardContent>
            </Card>
            <Card
            elevation={3}
            sx={{
                height: "30%",
                maxHeight: "30vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
            }}           
            >
            <CardHeader
              title="SỐ ĐÃ GỌI"
              sx={{ color: "white", bgcolor: "primary.main", textAlign: "center", maxHeight:"1px"}}
              slotProps={{
                title: {
                  sx: { fontSize: "20", fontWeight: "bold", fontFamily:"sans-serif", p: "1"}
                }
              }}
            />
            <CardContent sx={{display: "flex", textAlign: "center" }}>
             <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    height: "100%",
                    backgroundColor: "background.paper",
                }}
                >
                <Table stickyHeader>
                    <TableBody>
                    {queueList.filter(x => x.TrangThai === 2).map((item, index) => (
                        <Fade in={true} key={item.STT} timeout={300 + index * 100}>
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
                                fontSize: { xs: "1.2rem", sm: "1.2rem" },
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                            >
                            {item.STT.toString().padStart(3, "0")} - {item.Hoten} - {item.NamSinh}
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

        {/* Bên phải - Danh sách chờ */}
        <Grid size={{xs: 3, lg: 3}} >
            <Card
            elevation={3}
            sx={{
                height: "100%",
                maxHeight: "100vh",
                overflow: "auto",
            }}
            >
            <CardHeader
              title="SỐ TIẾP THEO"
              sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", maxHeight: "20px" }}
                slotProps={{
                  title: {
                    sx: { fontSize: "20px" }
                  }
                }}
            />
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
                    <TableBody>
                    {queueList.filter(x => x.TrangThai === 0).map((item, index) => (
                        <Fade in={true} key={item.STT} timeout={300 + index * 100}>
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
                                fontSize: { xs: "0.8rem", sm: "1rem" },
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                            >
                            {item.STT.toString().padStart(3, "0")}
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
  useEffect(() => {
    const handler = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      document.removeEventListener("click", handler);
    };

    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  }, []);
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
