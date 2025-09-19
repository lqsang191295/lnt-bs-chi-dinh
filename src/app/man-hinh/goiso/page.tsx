"use client";

import { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useQueue } from "@/hooks/ListPatientWaiting";
import { capnhatTrangThaiQueueNumbers } from "@/actions/act_dangkykhambenh";

interface iPatient {
  MaQuay: string
  STT: number
  Hoten: string
  NamSinh: string
  TrangThai: number
  isEmpty: boolean
  emptyIndex: number
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const queryClient = new QueryClient();

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

// Helper function để tạo danh sách đầy đủ với dòng trống
const createFullList = (data: iPatient[], maxItems: number) => {
  const currentItems = data.slice(0, maxItems);
  
  if (currentItems.length < maxItems) {
    const emptyRowsCount = maxItems - currentItems.length;
    const emptyRows = Array.from({ length: emptyRowsCount }, (_, index) => ({
      MaQuay: "",
      STT: 0,
      Hoten: "",
      NamSinh: "",
      TrangThai: 0,
      isEmpty: true,
      emptyIndex: index
    }));
    
    return [...currentItems, ...emptyRows];
  }
  
  return currentItems;
};

// Function viết tắt tên theo quy tắc mới
const abbreviateName = (fullName: string) => {
  if (fullName.length <= 17) return fullName;
  
  const words = fullName.trim().split(' ').filter(word => word.length > 0);
  
  // Nếu có 2 từ hoặc ít hơn: không viết tắt
  if (words.length <= 2) return fullName;
  
  // Nếu có 3 từ: Họ + Tên lót viết tắt + Tên
  if (words.length === 3) {
    const ho = words[0];
    const tenLot = words[1].charAt(0).toUpperCase() + '.';
    const ten = words[2];
    return `${ho} ${tenLot} ${ten}`;
  }
  
  // Nếu có > 3 từ: Họ + Các tên lót viết tắt + Tên
  const ho = words[0];
  const ten = words[words.length - 1];
  const tenLotVietTat = words.slice(1, -1).map(word => 
    word.charAt(0).toUpperCase() + '.'
  ).join(' ');
  
  return `${ho} ${tenLotVietTat} ${ten}`;
};

function QueueManagementComponent({ maQuay }: { maQuay: string }) {
  const { currentPatient, queueList, isLoading, error, refetch } = useQueue(maQuay);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Hiển thị thông báo
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Đóng thông báo
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Cập nhật trạng thái bệnh nhân
  const updatePatientStatus = async (stt: number, newStatus: number, actionName: string) => {
    try {
      const response = await capnhatTrangThaiQueueNumbers(`${newStatus}:${stt}`, maQuay);
      
      if (response.status === 'success') {
        showNotification(`${actionName} số ${stt.toString().padStart(3, "0")} thành công!`, 'success');
        // Refresh data sau khi cập nhật
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
        showNotification(`Lỗi ${actionName.toLowerCase()}: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('Error updating patient status:', error);
      showNotification(`Lỗi hệ thống khi ${actionName.toLowerCase()}`, 'error');
    }
  };

  // Xử lý click trái (left click)
  const handleLeftClick = (item: iPatient) => {
    if (item.isEmpty) return;

    if (item.TrangThai === 0) {
      // Từ danh sách chờ -> đang gọi (trạng thái = 1)
      updatePatientStatus(item.STT, 1, 'Gọi bệnh nhân');
    } else if (item.TrangThai === 1) {
      // Từ đang gọi -> hoàn thành (trạng thái = 3)
      updatePatientStatus(item.STT, 3, 'Hoàn thành khám');
    }
  };

  // Xử lý click phải (right click)
  const handleRightClick = (e: React.MouseEvent, item: iPatient) => {
    e.preventDefault(); // Ngăn context menu xuất hiện
    if (item.isEmpty) return;

    if (item.TrangThai === 1) {
      // Từ đang gọi -> đã gọi (trạng thái = 2)
      updatePatientStatus(item.STT, 2, 'Chuyển sang đã gọi');
    } else if (item.TrangThai === 2) {
      // Từ đã gọi -> hoàn thành (trạng thái = 3)
      updatePatientStatus(item.STT, 3, 'Hoàn thành khám');
    }
  };

  // Lấy dữ liệu hiển thị
  const displayCurrentPatient = currentPatient.filter((x) => x.TrangThai === 1)
    .map((item, idx) => ({
      ...item,
      MaQuay: item.MaQuay ?? "",
      Hoten: item.Hoten,
      NamSinh: String(item.NamSinh),
      STT: item.STT,
      TrangThai: item.TrangThai,
      isEmpty: false,
      emptyIndex: idx,
    }));

  const fullCurrentPatientList = createFullList(displayCurrentPatient, 5);

  const calledPatients = queueList
    .filter((x) => x.TrangThai === 2)
    .map((item, idx) => ({
      ...item,
      MaQuay: item.MaQuay ?? "",
      Hoten: item.Hoten,
      NamSinh: String(item.NamSinh),
      STT: item.STT,
      TrangThai: item.TrangThai,
      isEmpty: false,
      emptyIndex: idx,
    }));

  const fullCalledPatientList = createFullList(calledPatients, 3);

  const displayQueueList = queueList;

  if (isLoading) return <p>Đang tải...</p>;
  if (error) {
    console.log("Using sample data due to error:", error);
  }

  return (
    <>
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
              title="SỐ ĐANG GỌI (Click để hoàn thành - Click phải để chuyển sang đã gọi)"
              sx={{
                color: "white",
                bgcolor: "primary.main",
                textAlign: "center",
                py: 1,
              }}
              slotProps={{
                title: {
                  sx: {
                    fontSize: "1.2rem",
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
                "&:last-child": {
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
                    {fullCurrentPatientList.map((item, index) => {
                      const displayName = item.isEmpty ? "" : abbreviateName(item.Hoten);
                      const uniqueKey = item.isEmpty ? 
                        `empty-current-${index}` : 
                        `current-${item.STT}`;
                      return (
                        <Fade in={true} key={uniqueKey} timeout={300 + index * 100}>
                          <TableRow
                            className="animate-fade-in"
                            onClick={() => handleLeftClick(item)}
                            onContextMenu={(e) => handleRightClick(e, item)}
                            sx={{
                              height: "calc(100% / 5)",
                              cursor: item.isEmpty ? 'default' : 'pointer',
                              "&:nth-of-type(odd)": {
                                backgroundColor: item.isEmpty ? "transparent" : "#fafafa",
                                overflow: "hidden",
                              },
                              "&:hover": {
                                backgroundColor: item.isEmpty ? "transparent" : "#e3f2fd",
                              },
                              "&:last-child td": {
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
                                color: item.isEmpty ? "transparent" : "primary.main",
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
                                borderBottom: index === 4 ? "none" : undefined,
                              }}
                            >
                              <Box sx={{ textAlign: "left", justifySelf: "start" }}>
                                {item.isEmpty ? "" : `${item.STT.toString().padStart(3, "0")}.`}
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
                                {item.isEmpty ? "" : item.NamSinh}
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
              title="SỐ ĐÃ GỌI (Click phải để hoàn thành)"
              sx={{
                color: "white",
                bgcolor: "secondary.main",
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
                "&:last-child": {
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
                    {fullCalledPatientList.map((item, index) => {
                      const uniqueKey = item.isEmpty ? 
                        `empty-called-${index}` : 
                        `called-${item.STT}`;
                      
                      return (
                        <Fade in={true} key={uniqueKey} timeout={300 + index * 100}>
                          <TableRow
                            className="animate-fade-in"
                            onContextMenu={(e) => handleRightClick(e, item)}
                            sx={{
                              height: "calc(100% / 3)",
                              cursor: item.isEmpty ? 'default' : 'pointer',
                              "&:nth-of-type(odd)": {
                                backgroundColor: item.isEmpty ? "transparent" : "#fafafa",
                              },
                              "&:hover": {
                                backgroundColor: item.isEmpty ? "transparent" : "#fff3e0",
                              },
                              "&:last-child td": {
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
                                color: item.isEmpty ? "transparent" : "secondary.main",
                                py: 1.65,
                                lineHeight: 0.65,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                fontStyle: "italic",
                                gap: 3,
                                height: "100%",
                                borderBottom: index === 2 ? "none" : undefined,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{ minWidth: "100px", textAlign: "right" }}
                              >
                                {item.isEmpty ? "" : `${item.STT.toString().padStart(3, "0")}.`}
                              </Box>
                              <Box
                                component="span"
                                sx={{ flex: 1, textAlign: "center" }}
                              >
                                {item.isEmpty ? "" : item.Hoten}
                              </Box>
                              <Box
                                component="span"
                                sx={{ minWidth: "80px", textAlign: "left" }}
                              >
                                {item.isEmpty ? "" : item.NamSinh}
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
              title="SỐ TIẾP THEO (Click để gọi)"
              sx={{
                bgcolor: "#4CAF50",
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
              overflow: "auto",
              "&:last-child": {
                pb: 1,
              },
            }}>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  height: "100%",
                  backgroundColor: "background.paper",
                  overflow: "auto",
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
                            onClick={() => handleLeftClick(item)}
                            sx={{
                              cursor: 'pointer',
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                              },
                              "&:hover": {
                                backgroundColor: "#e8f5e8",
                              },
                              "&:last-child td": {
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
                                color: "#4CAF50",
                                py: 1.8,
                                px: 1,
                                lineHeight: 0.73,
                                borderBottom: index === array.length - 1 ? "none" : "1px solid #e0e0e0",
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

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%', fontSize: '1.1rem' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// Tạo theme MUI tùy chỉnh
const theme = createTheme({
  palette: {
    primary: {
      main: "#354b9c",
    },
    secondary: {
      main: "#FF9800",
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

export default function QueueManagementDisplay() {
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
          <QueueManagementComponent maQuay={maQuay} />
        </QueryClientProvider>
      </Box>
    </ThemeProvider>
  );
}