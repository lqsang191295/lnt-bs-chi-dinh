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
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT

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
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedKhoa, setSelectedKhoa] = useState("all");
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const { data: loginedUser, setUserData } = useUserStore();
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
              onChange={(e) => setSelectedKhoa(e.target.value)}>
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

        <Box className="w-full h-full">
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
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
