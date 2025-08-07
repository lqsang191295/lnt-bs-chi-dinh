// app/hosobenhan/page.tsx
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import { gettDMKhoaPhongs } from "@/actions/emr_tdmkhoaphong";
import { getHosobenhan } from "@/actions/emr_hosobenhan";
import { useUserStore } from "@/store/user";

export default function HosoBenhAnPage() {
  const columns: GridColDef[] = [
    { field: "ID", headerName: "ID", width: 60 },
    {
      field: "TrangThaiBA",
      headerName: "Trạng thái",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color={params.value === "MO" ? "success" : "primary"}>
          {params.value}
        </Button>
      ),
    },
    { field: "SoLuuTru", headerName: "Số lưu trữ", width: 100 },
    { field: "MaBANoiTru", headerName: "Mã BA", width: 130 },
    { field: "Hoten", headerName: "Họ và tên", width: 200 },
    { field: "MaBN", headerName: "Mã BN", width: 130 },
    { field: "Ngaysinh", headerName: "Ngày sinh", width: 130 },
    { field: "NgayVao", headerName: "Ngày vào viện", width: 130 },
    { field: "NgayRa", headerName: "Ngày ra viện", width: 130 },
    { field: "KhoaVaoVien", headerName: "Khoa nhập viện", width: 100 },
    { field: "KhoaDieuTri", headerName: "Khoa điều trị", width: 200 },
    { field: "LoaiBenhAn", headerName: "Loại BA", width: 130 },
    { field: "BsDieuTriKyTen", headerName: "Bác sĩ điều trị", width: 130 },
    // { field: "doiTuong", headerName: "Đối tượng", width: 100 },
    // { field: "hinhThuc", headerName: "Hình thức xử trí", width: 130 },
    // { field: "phieu", headerName: "Phiếu", width: 100 },
  ];
  /*
  ID, MaBANoiTru, SoBenhAn, MaBN, Hoten, Ngaysinh, Gioitinh, Dienthoai,
          Diachi, SoCCCD, SoNhapVien, SoVaoVien, SoLuuTru, KhoaVaoVien, KhoaDieuTri,
          NgayVao, NgayRa, LoaiBenhAn, NoiDungJson, NoiDungXml, NoiDungPdf,
          TruongKhoaKyTen, GdbvKyTen, BsLamBAKyTen, BsDieuTriKyTen, TrangThaiBA,
          NgayCapNhat, NgayTao
  */
  // State variables
  
  const { data: loginedUser } = useUserStore();
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  // Fetch khoa list from API
  useEffect(() => {
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
    const data = await getHosobenhan(loginedUser.ctaikhoan, popt, selectedKhoa, formatDate(tuNgay), formatDate(denNgay));
     
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
      <Box p={2}>
        <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          TRA CỨU HỒ SƠ BỆNH ÁN
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={3}>
            <Select
              fullWidth
              value={selectedKhoa}
              onChange={(e) => setSelectedKhoa(e.target.value)}
            >
              {khoaList.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={3}>
            <FormControl>
              <FormLabel id="popt-radio-group-label" sx={{ color: "#1976d2", fontWeight: "bold" }}
              ></FormLabel>
              <RadioGroup
                row
                aria-labelledby="popt-radio-group-label"
                name="popt-radio-group"
                value={popt}
                onChange={(e) => setPopt(e.target.value)}
              >
                <FormControlLabel value="1" control={<Radio
                  sx={{
                    color: "#1976d2",
                    "&.Mui-checked": { color: "#1976d2" },
                  }} />} label="Ngày vào viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }} />
                <FormControlLabel value="2" control={<Radio
                  sx={{
                    color: "#1976d2",
                    "&.Mui-checked": { color: "#1976d2" },
                  }} />} label="Ngày ra viện"
                  sx={{ color: "#1976d2", fontWeight: "bold" }} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={setTuNgay}
              format="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={2}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={setDenNgay}
              format="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={2}>
            <Button fullWidth variant="contained" onClick={handleSearch}>
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