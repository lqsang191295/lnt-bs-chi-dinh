// app/hosobenhan/page.tsx
"use client";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

export default function HosoBenhAnPage() {
  const columns: GridColDef[] = [
    { field: "id", headerName: "STT", width: 60 },
    {
      field: "trangThai",
      headerName: "Trạng thái",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color={params.value === "Mở" ? "success" : "primary"}>
          {params.value}
        </Button>
      ),
    },
    { field: "trangThaiLuuTru", headerName: "Trạng thái lưu trữ", width: 150 },
    { field: "phieuBG", headerName: "Phiếu BG", width: 100 },
    { field: "maBA", headerName: "Mã BA", width: 130 },
    { field: "hoTen", headerName: "Họ và tên", width: 200 },
    { field: "maBN", headerName: "Mã BN", width: 130 },
    { field: "ngaySinh", headerName: "Ngày sinh", width: 130 },
    { field: "ngayVaoVien", headerName: "Ngày vào viện", width: 130 },
    { field: "ngayRaVien", headerName: "Ngày ra viện", width: 130 },
    { field: "soLuuTru", headerName: "Số lưu trữ", width: 100 },
    { field: "khoa", headerName: "Khoa", width: 200 },
    { field: "loaiBA", headerName: "Loại BA", width: 130 },
    { field: "loaiDieuTri", headerName: "Loại hình điều trị", width: 130 },
    { field: "doiTuong", headerName: "Đối tượng", width: 100 },
    { field: "hinhThuc", headerName: "Hình thức xử trí", width: 130 },
    { field: "phieu", headerName: "Phiếu", width: 100 },
  ];

  const rows = [
    {
      id: 1,
      trangThai: "Mở",
      trangThaiLuuTru: "Chưa lưu trữ",
      phieuBG: "",
      maBA: "BA2507290216",
      hoTen: "TEST KSK LA KIM NGAN",
      maBN: "BN00038313",
      ngaySinh: "01/01/1969",
      ngayVaoVien: "29/07/2025",
      ngayRaVien: "29/07/2025",
      soLuuTru: "",
      khoa: "Khoa Khám bệnh - Liên chuyên khoa",
      loaiBA: "Khám bệnh",
      loaiDieuTri: "Khám bệnh",
      doiTuong: "Miễn phí",
      hinhThuc: "Không thay đổi",
      phieu: "0 / 0",
    },
    // thêm dữ liệu mẫu...
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          TRA CỨU HỒ SƠ BỆNH ÁN
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={3}>
            <Select fullWidth defaultValue="all">
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="khoa1">Khoa A</MenuItem>
              <MenuItem value="khoa2">Khoa B</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={2}>
            <DatePicker label="Từ ngày" />
          </Grid>
          <Grid item xs={2}>
            <DatePicker label="Đến ngày" />
          </Grid>
          <Grid item xs={2}>
            <Button fullWidth variant="contained">
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ height: 550, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                border: "1px solid #e0e0e0",
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
