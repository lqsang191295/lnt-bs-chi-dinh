"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Roboto } from "next/font/google";

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
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useQueue } from "@/hooks/ListPatientWaiting";

const queryClient = new QueryClient();

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

// Dữ liệu mẫu cho demo
const sampleData = {
  currentPatient: [
    { STT: 1, Hoten: "NGUYỄN NGỌC QUỲNH NGHIÊNG", NamSinh: "1985", TrangThai: 1 },
    { STT: 2, Hoten: "TRẦN HUỲNH NHƯ BÌNH", NamSinh: "1990", TrangThai: 1 },
    { STT: 3, Hoten: "LÊ TRẦN NGỌC PHÁT", NamSinh: "1975", TrangThai: 1 },
    { STT: 4, Hoten: "PHẠM THỊ DUNG", NamSinh: "1988", TrangThai: 1 },
    { STT: 5, Hoten: "HOÀNG VĂN ĐẠT", NamSinh: "1992", TrangThai: 1 },
  ],
  queueList: [
    // Số đã gọi (TrangThai = 2)
    { STT: 15, Hoten: "VŨ THỊ MAI", NamSinh: "1987", TrangThai: 2 },
    { STT: 16, Hoten: "ĐỖ VĂN NAM", NamSinh: "1983", TrangThai: 2 },
    { STT: 17, Hoten: "BÙI THỊ OANH", NamSinh: "1995", TrangThai: 2 },

    // Số tiếp theo (TrangThai = 0)
    { STT: 6, Hoten: "NGÔ VĂN PHÚC", NamSinh: "1980", TrangThai: 0 },
    { STT: 7, Hoten: "ĐINH QUỲNH NGHIÊNG", NamSinh: "1993", TrangThai: 0 },
    { STT: 8, Hoten: "LÝ VĂN SƠN", NamSinh: "1977", TrangThai: 0 },
    { STT: 9, Hoten: "VÕ THỊ TÂM", NamSinh: "1989", TrangThai: 0 },
    { STT: 10, Hoten: "TRỊNH VĂN UY", NamSinh: "1986", TrangThai: 0 },
    { STT: 11, Hoten: "DƯƠNG THỊ VÂN", NamSinh: "1991", TrangThai: 0 },
    { STT: 12, Hoten: "PHAN VĂN XUÂN", NamSinh: "1984", TrangThai: 0 },
    { STT: 13, Hoten: "TÔN THỊ YẾN", NamSinh: "1996", TrangThai: 0 },
    { STT: 14, Hoten: "HÀ VĂN ZUNG", NamSinh: "1978", TrangThai: 0 },
  ],
};

// Function viết tắt tên theo quy tắc mới
const abbreviateName = (fullName: string) => {
  if (fullName.length <= 17) return fullName;
  
  const words = fullName.trim().split(' ').filter(word => word.length > 0);
  
  // Nếu có 2 từ hoặc ít hơn: không viết tắt
  if (words.length <= 2) return fullName;
  
  // Nếu có 3 từ: Họ + Tên lót viết tắt + Tên
  if (words.length === 3) {
    const ho = words[0];           // Họ
    const tenLot = words[1].charAt(0).toUpperCase() + '.'; // Tên lót viết tắt
    const ten = words[2];          // Tên
    return `${ho} ${tenLot} ${ten}`;
  }
  
  // Nếu có > 3 từ: Họ + Các tên lót viết tắt + Tên
  const ho = words[0];                              // Họ
  const ten = words[words.length - 1];              // Tên (từ cuối)
  const tenLotVietTat = words.slice(1, -1).map(word => 
    word.charAt(0).toUpperCase() + '.'
  ).join(' ');                                      // Các tên lót viết tắt
  
  return `${ho} ${tenLotVietTat} ${ten}`;
};

// Examples:
// "NGUYỄN QUỲNH NGHIÊNG" (3 từ) → "NGUYỄN Q. NGHIÊNG"
// "TRẦN VĂN MINH QUANG" (4 từ) → "TRẦN V. M. QUANG" 
// "ĐINH QUỲNH NGHIÊNG" (3 từ) → "ĐINH Q. NGHIÊNG"
// "TRẦN THỊ BÌNH" (3 từ) → "TRẦN T. BÌNH"
// "LÊ VĂN" (2 từ) → "LÊ VĂN" (không viết tắt)

function QueueComponent({ maQuay }: { maQuay: string }) {
  const { currentPatient, queueList, isLoading, error } = useQueue(maQuay);

  // Sử dụng dữ liệu mẫu nếu data rỗng hoặc có lỗi
  const displayCurrentPatient =
    currentPatient?.length > 0 ? currentPatient : sampleData.currentPatient;

  const displayQueueList = sampleData.queueList;
  if (isLoading) return <p>Đang tải...</p>;
  if (error) {
    console.log("Using sample data due to error:", error);
  }

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
      <Grid size={{ xs: 9, lg: 9 }}>
        {/* SỐ ĐANG GỌI */}
        <Card
          elevation={3}
          sx={{
            height: "70%",
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
            overflow: "hidden",
          }}
        >
          <CardHeader
            title="SỐ ĐANG GỌI"
            sx={{
              color: "white",
              bgcolor: "primary.main",
              textAlign: "center",
              py: 1,
            }}
            slotProps={{
              title: {
                sx: {
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  fontFamily: "roboto",
                  fontKerning: "optical",
                  letterSpacing: "0.05em",
                },
              },
            }}
          />
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              minHeight: 0,
              overflow: "hidden",
              "&:last-child": { // Bỏ padding bottom mặc định của CardContent
                pb: 0,
              },
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                maxHeight: "calc(70vh - 60px)",
                overflow: "hidden",
              }}
            >
              <Table stickyHeader sx={{ tableLayout: "fixed" }}>
                <TableBody>
                  {displayCurrentPatient.slice(0, 5).map((item, index) => {
                    const displayName = abbreviateName(item.Hoten);
                    
                    return (
                      <Fade in={true} key={item.STT} timeout={300 + index * 100}>
                        <TableRow
                          className="animate-fade-in"
                          sx={{
                            height: "calc(100% / 5)",
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#fafafa",
                              overflow: "hidden",
                            },
                            "&:last-child td": { // Bỏ border bottom của row cuối
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: "roboto", 
                              fontSize: `clamp(1.7rem, 2.5rem, 3rem)`,
                              letterSpacing: "0.05em",
                              fontWeight: 650,
                              color: "primary.main",
                              py: 1,
                              px: 2.0,
                              lineHeight: 1.4,
                              display: "grid",
                              gridTemplateColumns: `clamp(80px, 100px, 120px) 1fr clamp(80px, 90px, 100px)`,
                              gap: `clamp(0.5rem, 0.5rem, 1rem)`,
                              alignItems: "left",
                              width: "100%",
                              height: "100%",
                              minHeight: "75px",
                              borderBottom: index === 4 ? "none" : undefined, // Bỏ border bottom của cell cuối
                            }}
                          >
                            <Box sx={{ textAlign: "left", justifySelf: "start" }}>
                              {item.STT.toString().padStart(3, "0")}.
                            </Box>
                            <Box sx={{
                              textAlign: "left",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              justifySelf: "left",
                            }}>
                              {displayName}
                            </Box>
                            <Box sx={{ textAlign: "right", justifySelf: "start" }}>
                              {item.NamSinh}
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* SỐ ĐÃ GỌI */}
        <Card
          elevation={3}
          sx={{
            height: "30%",
            maxHeight: "30vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
            overflow: "hidden",
          }}
        >
          <CardHeader
            title="SỐ ĐÃ GỌI"
            sx={{
              color: "white",
              bgcolor: "primary.main",
              textAlign: "center",
              py: 1,
            }}
            slotProps={{
              title: {
                sx: {
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  fontFamily: "roboto",
                  letterSpacing: "0.05em",
                },
              },
            }}
          />
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              textAlign: "center",
              p: 0,
              minHeight: 0,
              overflow: "hidden",
              "&:last-child": { // Bỏ padding bottom mặc định của CardContent
                pb: 0,
              },
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                maxHeight: "calc(30vh - 60px)",
                overflow: "hidden",
              }}
            >
              <Table stickyHeader sx={{ tableLayout: "fixed" }}>
                <TableBody>
                  {displayQueueList
                    .filter((x) => x.TrangThai === 2)
                    .slice(0, 3)
                    .map((item, index) => (
                      <Fade
                        in={true}
                        key={item.STT}
                        timeout={300 + index * 100}
                      >
                        <TableRow
                          className="animate-fade-in"
                          sx={{
                            height: "calc(100% / 3)",
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#fafafa",
                            },
                            "&:last-child td": { // Bỏ border bottom của row cuối
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              fontFamily: "roboto",
                              fontSize: {
                                xs: "1.5rem",
                                sm: "1.5rem",
                                letterSpacing: "0.05em",
                              },
                              fontWeight: 600,
                              color: "primary.main",
                              py: 1.65,
                              lineHeight: 0.65,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              fontStyle: "italic",
                              gap: 3,
                              height: "100%",
                              borderBottom: index === 2 ? "none" : undefined, // Bỏ border bottom của cell cuối
                            }}
                          >
                            <Box
                              component="span"
                              sx={{ minWidth: "100px", textAlign: "right" }}
                            >
                              {item.STT.toString().padStart(3, "0")}.
                            </Box>
                            <Box
                              component="span"
                              sx={{ flex: 1, textAlign: "center" }}
                            >
                              {item.Hoten}
                            </Box>
                            <Box
                              component="span"
                              sx={{ minWidth: "80px", textAlign: "left" }}
                            >
                              {item.NamSinh}
                            </Box>
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
      <Grid size={{ xs: 3, lg: 3 }}>
        <Card
          elevation={3}
          sx={{
            height: "100%",
            maxHeight: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column", 
          }}
        >
          <CardHeader
            title="SỐ TIẾP THEO"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              textAlign: "center",
              py: 1,
              flexShrink: 0,
            }}
            slotProps={{
              title: {
                sx: {
                  fontFamily: "roboto",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                },
              },
            }}
          />
          <CardContent sx={{ 
            p: 1, 
            flex: 1, 
            overflow: "hidden",
            "&:last-child": { // Bỏ padding bottom mặc định của CardContent
              pb: 1,
            },
          }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
                <TableBody>
                  {displayQueueList
                    .filter((x) => x.TrangThai === 0)
                    .map((item, index, array) => (
                      <Fade
                        in={true}
                        key={item.STT}
                        timeout={300 + index * 100}
                      >
                        <TableRow
                          className="animate-fade-in"
                          sx={{
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#fafafa",
                            },
                            "&:last-child td": { // Bỏ border bottom của row cuối
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              fontFamily: "roboto",
                              fontSize: {
                                xs: "3.5rem",
                                sm: "3.5rem",
                                letterSpacing: "0.05em",
                              },
                              fontWeight: 700,
                              color: "primary.main",
                              py: 1.8,
                              px: 1,
                              lineHeight: 0.73,
                              borderBottom: index === array.length - 1 ? "none" : "1px solid #e0e0e0", // Bỏ border bottom của cell cuối
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
});

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
  );
}
