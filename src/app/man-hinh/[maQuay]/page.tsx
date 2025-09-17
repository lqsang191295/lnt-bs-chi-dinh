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
    {
      STT: 1,
      Hoten: "Nguyễn Văn Quỳnh Nghiêng",
      NamSinh: "1985",
      TrangThai: 1,
    },
    { STT: 2, Hoten: "Trần Thị Bình", NamSinh: "1990", TrangThai: 1 },
    { STT: 3, Hoten: "Lê Văn Cường", NamSinh: "1975", TrangThai: 1 },
    { STT: 4, Hoten: "Phạm Thị Dung", NamSinh: "1988", TrangThai: 1 },
    { STT: 5, Hoten: "Hoàng Văn Đạt", NamSinh: "1992", TrangThai: 1 },
  ],
  queueList: [
    // Số đã gọi (TrangThai = 2)
    { STT: 15, Hoten: "Vũ Thị Mai", NamSinh: "1987", TrangThai: 2 },
    { STT: 16, Hoten: "Đỗ Văn Nam", NamSinh: "1983", TrangThai: 2 },
    { STT: 17, Hoten: "Bùi Thị Oanh", NamSinh: "1995", TrangThai: 2 },

    // Số tiếp theo (TrangThai = 0)
    { STT: 6, Hoten: "Ngô Văn Phúc", NamSinh: "1980", TrangThai: 0 },
    { STT: 7, Hoten: "Đinh Thị Quỳnh Nghiêng", NamSinh: "1993", TrangThai: 0 },
    { STT: 8, Hoten: "Lý Văn Sơn", NamSinh: "1977", TrangThai: 0 },
    { STT: 9, Hoten: "Võ Thị Tâm", NamSinh: "1989", TrangThai: 0 },
    { STT: 10, Hoten: "Trịnh Văn Uy", NamSinh: "1986", TrangThai: 0 },
    { STT: 11, Hoten: "Dương Thị Vân", NamSinh: "1991", TrangThai: 0 },
    { STT: 12, Hoten: "Phan Văn Xuân", NamSinh: "1984", TrangThai: 0 },
    { STT: 13, Hoten: "Tôn Thị Yến", NamSinh: "1996", TrangThai: 0 },
    { STT: 14, Hoten: "Hà Văn Zung", NamSinh: "1978", TrangThai: 0 },
  ],
};

function QueueComponent({ maQuay }: { maQuay: string }) {
  const { currentPatient, queueList, isLoading, error } = useQueue(maQuay);

  // Sử dụng dữ liệu mẫu nếu data rỗng hoặc có lỗi
  const displayCurrentPatient =
    currentPatient?.length > 0 ? currentPatient : sampleData.currentPatient;

  // const displayQueueList = queueList?.length > 0
  //   ? queueList
  //   : sampleData.queueList;
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
        {/* SỐ ĐANG GỌI - Tăng chiều cao để hiển thị đủ 5 dòng */}
        <Card
          elevation={3}
          sx={{
            height: "70%", // Tăng từ 70% lên 75%
            maxHeight: "70vh", // Tăng từ 70vh lên 75vh
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
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
              p: 0, // Bỏ padding để tối đa hóa không gian
              minHeight: 0, // Đảm bảo flex item có thể shrink
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                maxHeight: "calc(70vh - 60px)", // Điều chỉnh theo header mới
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
                <TableBody>
                  {displayCurrentPatient.slice(0, 5).map((item, index) => (
                    <Fade in={true} key={item.STT} timeout={300 + index * 100}>
                      <TableRow
                        className="animate-fade-in"
                        sx={{
                          height: "calc(100% / 5)", // Chia đều chiều cao cho 5 dòng
                          "&:nth-of-type(odd)": {
                            backgroundColor: "#fafafa",
                          },
                        }}
                      >
                         <TableCell
                          sx={{
                            fontFamily: "roboto", 
                            fontSize: `clamp(1.7rem, ${Math.max(
                              1.7,
                              2.7 - item.Hoten.length * 0.04
                            )}rem, 2.7rem)`,
                            letterSpacing: "0.05em",
                            fontWeight: 650,
                            color: "primary.main",
                            py: 2.5, // Padding lớn hơn để tránh cắt text
                            px: 1,
                            lineHeight: 1,
                            display: "grid",
                            gridTemplateColumns: `clamp(80px, ${Math.max(80, 120 - item.Hoten.length * 1.5)}px, 120px) 1fr clamp(80px, ${Math.max(80, 100 - item.Hoten.length * 1)}px, 100px)`,
                            gap: `clamp(0.5rem, ${Math.max(0.5, 2 - item.Hoten.length * 0.1)}rem, 2rem)`,
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            minHeight: "75px", // Chiều cao đủ lớn
                          }}
                        >
                          <Box sx={{ textAlign: "right", justifySelf: "end" }}>
                            {item.STT.toString().padStart(3, "0")}.
                          </Box>
                          <Box sx={{ 
                            textAlign: "center", 
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            justifySelf: "center",
                          }}>
                            {item.Hoten}
                          </Box>
                          <Box sx={{ textAlign: "left", justifySelf: "start" }}>
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

        {/* SỐ ĐÃ GỌI - Giảm chiều cao tương ứng */}
        <Card
          elevation={3}
          sx={{
            height: "30%", // Giảm từ 30% xuống 25%
            maxHeight: "30vh", // Giảm từ 30vh xuống 25vh
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
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
            }}
          >
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                maxHeight: "calc(30vh - 60px)", // Điều chỉnh theo chiều cao mới
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
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
                            height: "calc(100% / 3)", // Chia đều cho 3 dòng
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#fafafa",
                            },
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              fontFamily: "roboto",
                              fontKerning: "optical",
                              fontSize: {
                                xs: "1.5rem",
                                sm: "1.5rem",
                                letterSpacing: "0.05em",
                              }, // Giảm font size cho phù hợp
                              fontWeight: 600,
                              color: "primary.main",
                              py: 1.65, // Tăng padding
                              lineHeight: 0.65, // Tăng line height
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              fontStyle: "italic",
                              gap: 3, // Giảm gap cho phù hợp
                              height: "100%", // Đảm bảo cell chiếm full height
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
          <CardContent sx={{ p: 1, flex: 1, overflow: "auto" }}>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
              }}
            >
              <Table stickyHeader size="small">
                <TableBody>
                  {displayQueueList
                    .filter((x) => x.TrangThai === 0)
                    .map((item, index) => (
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
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              fontFamily: "roboto",
                              fontSize: {
                                xs: "4.5rem",
                                sm: "4.5rem",
                                letterSpacing: "0.05em",
                              },
                              fontWeight: 700,
                              color: "primary.main",
                              py: 2.2,
                              px: 1,
                              lineHeight: 0.76,
                              borderBottom: "1px solid #e0e0e0",
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
