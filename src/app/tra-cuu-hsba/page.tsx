// app/dong-mo-hsba/page.tsx
"use client";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DescriptionIcon from '@mui/icons-material/Description';
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import { gettDMKhoaPhongs } from "@/actions/emr_tdmkhoaphong";
import { getHosobenhan, getChiTietHSBA } from "@/actions/emr_hosobenhan";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT

export default function tracuuhsbaPage() {
  const columns: GridColDef[] = [
    { field: "ID", headerName: "ID", width: 60 },
    {
      field: "TrangThaiBA",
      headerName: "Trạng thái",
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: "transparent",
            color: params.value === "MO" ? "#8200fcff" : "#f44336", // Màu vàng cho MO, màu đỏ cho DONG,
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            minWidth: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
          {params.value === "MO" ? (
            <>
              <LockOpenIcon sx={{ fontSize: "14px" }} />
              Mở
            </>
          ) : (
            <>
              <LockOutlinedIcon sx={{ fontSize: "14px" }} />
              Đóng
            </>
          )}
        </Box>
      ),
    },
    // { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
    { field: "Hoten", headerName: "Họ và tên", width: 200 },
    { field: "MaBN", headerName: "Mã BN", width: 130 },
    { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
    { field: "SoVaoVien", headerName: "Số vào viện", width: 130 },
    { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
    { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
    { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
    { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
    { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
    { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
    { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
    { field: "NgayLuuTru", headerName: "Ngày lưu trữ", width: 100 },
    { field: "ViTriLuuTru", headerName: "Vị trí lưu trữ", width: 150 },
    { field: "TenLoaiLuuTru", headerName: "Loại lưu trữ", width: 200 },
    { field: "SoNamLuuTru", headerName: "Số năm lưu trữ", width: 150 },
  ];
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  // State cho dialog chi tiết
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedHsbaForDetail, setSelectedHsbaForDetail] = useState<any>(null);
  const [phieuList, setPhieuList] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");  
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string>(""); // Thêm state để track blob URL
  const [xmlContent, setXmlContent] = useState<string>("");
  const { data: loginedUser, setUserData } = useUserStore();


  // Columns cho lưới chi tiết phiếu
  const phieuColumns: GridColDef[] = [
    { field: 'Stt', headerName: 'STT', width: 60 },
    { field: 'TenPhieu', headerName: 'Loại Phiếu', width: 250 },
    { field: 'NgayTaoPhieu', headerName: 'Ngày Tạo', width: 150 },
    { field: 'NgayKySo', headerName: 'Ngày Ký', width: 150 },
  ];

 // Hàm chuyển đổi base64 thành Blob URL
  const createPdfBlobUrl = (base64Data: string): string => {
    try {
      // Xóa prefix nếu có
      const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
      
      // Chuyển đổi base64 thành binary
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Tạo Blob
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      // Tạo Blob URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating PDF blob:", error);
      return "";
    }
  };

  // Hàm dọn dẹp Blob URL
  const cleanupBlobUrl = (url: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };


  // Hàm xử lý double click trên lưới chính
  const handleRowDoubleClick = async (params: GridRowParams) => {
    const hsba = params.row;
    //console.log("Selected HSBA for detail:", hsba);
    setSelectedHsbaForDetail(hsba);
    
    try {
      // Gọi API để lấy danh sách phiếu chi tiết
      const chiTietData = await getChiTietHSBA(loginedUser.ctaikhoan,popt,hsba.ID); // Cần có hàm này trong actions
      const mappedData = (chiTietData || []).map((item: any, index: number) => ({
        id: item.ID || index + 1, // Sử dụng ID từ data hoặc index làm id
        ...item
      }));

        setPhieuList(mappedData);
      if (mappedData && mappedData.length > 0) {
        const base64Data = mappedData[0].FilePdfKySo;
        if (base64Data) {
          // Dọn dẹp URL cũ trước khi tạo mới
          if (currentBlobUrl) {
            cleanupBlobUrl(currentBlobUrl);
          }
          
          const blobUrl = createPdfBlobUrl(base64Data);
          setPdfUrl(blobUrl);
          setCurrentBlobUrl(blobUrl);
        } else {
          setPdfUrl("");
          setCurrentBlobUrl("");
        }
      } else {
        setPdfUrl("");
        setCurrentBlobUrl("");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết HSBA:", error);
      setPhieuList([]);
      setPdfUrl("");
      setCurrentBlobUrl("");
    }
    
    setOpenDetailDialog(true);
  };
 

 // Hàm xử lý khi click vào một phiếu trong lưới chi tiết
  const handlePhieuRowClick = (params: GridRowParams) => {
    const base64Data = params.row.FilePdfKySo;
    if (base64Data) {
      // Dọn dẹp URL cũ trước khi tạo mới
      if (currentBlobUrl) {
        cleanupBlobUrl(currentBlobUrl);
      }
      
      const blobUrl = createPdfBlobUrl(base64Data);
      setPdfUrl(blobUrl);
      setCurrentBlobUrl(blobUrl);
    } else {
      setPdfUrl("");
      setCurrentBlobUrl("");
    }
  };

  // Hàm đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    // Dọn dẹp Blob URL khi đóng dialog
    if (currentBlobUrl) {
      cleanupBlobUrl(currentBlobUrl);
    }
    
    setOpenDetailDialog(false);
    setSelectedHsbaForDetail(null);
    setPhieuList([]);
    setPdfUrl("");
    setCurrentBlobUrl("");
  };
  
  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrl) {
        cleanupBlobUrl(currentBlobUrl);
      }
    };
  }, [currentBlobUrl]);

  // Fetch khoa list from API
  useEffect(() => {
    // if (!loginedUser || !loginedUser.ctaikhoan) {
    //   router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
    //   return;
    // }
    const claims = getClaimsFromToken();
    if (claims) {
      setUserData(claims);
      // Log or handle the claims as needed
      //console.log("User claims:", claims);
      // You can set user claims in a global state or context if needed
    } else {
      console.warn("No valid claims found in token");
    }
    async function fetchKhoaList() {
      try {
        const result = await gettDMKhoaPhongs();
        // console.log("Khoa Phongs fetched:", result);
        if (Array.isArray(result)) {
          const mapped = result.map((item: any) => ({
            value: item.cmakhoa,
            label: item.ckyhieu + " - " + item.ctenkhoa,
          }));
          setKhoaList([{ value: "all", label: "Tất cả" }, ...mapped]);
        } else {
          setKhoaList([{ value: "all", label: "Tất cả" }]);
        }
      } catch (error) {
        setKhoaList([{ value: "all", label: "Tất cả" }]);
      }
    }
    fetchKhoaList();
  }, []);

  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    if (!tuNgay || !denNgay) return;
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const data = await getHosobenhan(
      loginedUser.ctaikhoan,
      popt,
      selectedKhoa,
      formatDate(tuNgay),
      formatDate(denNgay)
    );

    setRows(
      (data || []).map((item: any, idx: number) => ({
        id: idx + 1,
        ...item,
      }))
    );
    //console.log("Search results:", data);
  };
  // Render component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          TRA CỨU HỒ SƠ BỆNH ÁN
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              size="small"
              onChange={(e) => setSelectedKhoa(e.target.value)}
              displayEmpty
              >
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box flex={2}>
            <FormControl>
              <FormLabel
                id="popt-radio-group-label"
                sx={{ color: "#1976d2", fontWeight: "bold" }}
              />
              <RadioGroup
                row
                aria-labelledby="popt-radio-group-label"
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}>
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                      size="small"
                    />
                  }
                  label="Ngày vào viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                />
                <FormControlLabel
                  value="2"
                  control={
                    <Radio
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                      size="small"
                    />
                  }
                  label="Ngày ra viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
          </Box>
          <Box flex={1}>
            <Button fullWidth variant="contained" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>
        </Box>

        <Box className="w-full" sx={{ height: 'calc(100vh - 200px)' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact" 
            onRowDoubleClick={handleRowDoubleClick} // Thêm sự kiện double click
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                border: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "white",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#e3f2fd !important",
              },
            }}
          />
        </Box>
        
      </Box>
      
      {/* Dialog Chi tiết HSBA */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        fullWidth 
        maxWidth="xl"
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          backgroundColor: '#1976d2', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          CHI TIẾT HỒ SƠ BỆNH ÁN: {selectedHsbaForDetail?.Hoten} - {selectedHsbaForDetail?.MaBN}
          <IconButton onClick={handleCloseDetailDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, m: 0, height: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Vùng 1: Các nút chức năng */}
          <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<PrintIcon />}>In HSBA</Button>
            <Button variant="contained" startIcon={<DescriptionIcon />}>Xuất XML</Button>
          </Box>

          {/* Vùng 2: Lưới chi tiết và PDF viewer */}
          <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
            {/* Vùng trái: Lưới chi tiết phiếu */}
             <Grid xs={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>  
              <Box sx={{ flex: 1, height: '100%' }}>
                <DataGrid
                  rows={phieuList}
                  columns={phieuColumns}
                  density="compact"
                  onRowClick={handlePhieuRowClick}
                  hideFooter
                />
              </Box>
              </Grid>  

            {/* Vùng phải: Hiển thị PDF */}
             <Grid xs={7} sx={{ 
              borderLeft: '1px solid #e0e0e0', 
              height: '100%', 
              display: 'flex',
              // width: '100%',
              // flexDirection: 'column'
            }}> 
              {pdfUrl ? (
                <Box sx={{ 
                  flex: 1, 
                  width: '100%', 
                  height: '100%',
                  '& object': {
                    width: '100%',
                    height: '100%'
                  }
                }}>
                  <object
                    data={pdfUrl}
                    type="application/pdf" 
                    style={{ border: 'none', width: '100%', height: '100%' }}
                  >
                    {/* <iframe
                      src={pdfUrl}
                      style={{ 
                        border: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                      title="PDF Viewer"
                    /> */}
                  </object>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  backgroundColor: '#f5f5f5'
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Chọn một phiếu để xem chi tiết PDF
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}
