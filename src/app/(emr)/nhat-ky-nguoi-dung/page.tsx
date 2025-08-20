// src/app/nhat-ky-nguoi-dung/page.tsx
"use client";

import { gettnhatkynguoidung } from "@/actions/act_tnguoidung";
import { useUserStore } from "@/store/user";
import { Refresh, Search } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useState } from "react";

// Dữ liệu cứng cho bảng
interface DataRow {
  cid: string;
  ctaikhoan: string;
  choten: string;
  cdienthoai: string;
  tngaythaotac: string;
  cthaotac: string;
  cnoidung: string;
}

const columns = [
  { field: "cid", headerName: "ID", width: 60 },
  { field: "ctaikhoan", headerName: "Tài khoản", width: 150, filterable: true },
  { field: "choten", headerName: "Họ tên", width: 150, filterable: true },
  {
    field: "cdienthoai",
    headerName: "Điện thoại",
    width: 130,
    filterable: true,
  },
  {
    field: "tngaythaotac",
    headerName: "Ngày thao tác",
    width: 180,
    filterable: true,
  },
  { field: "cthaotac", headerName: "Thao tác", width: 100, filterable: true },
  { field: "cnoidung", headerName: "Nội dung", width: 400 },
];
export default function NhatKyNguoiDungPage() {
  const [searchTerm] = React.useState(""); // Tên tài liệu
  const [searchStatus] = React.useState(""); // Tình trạng xét xuất
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [searchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"
  const [mockData, setRows] = React.useState<DataRow[]>([]); // Dữ liệu bảng
  // State và hàm cho Pagination
  const { data: loginedUser } = useUserStore();
  const [popt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const handleSearch = async () => {
    console.log("Searching with:", {
      searchTerm,
      searchStatus,
      searchTuNgay,
      searchDenNgay,
      searchDateType,
    });
    // Logic lọc dữ liệu mockData
    if (!searchTuNgay || !searchDenNgay) return;
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const data = await gettnhatkynguoidung(
      loginedUser.ctaikhoan,
      popt,
      formatDate(searchTuNgay),
      formatDate(searchDenNgay)
    );

    setRows(
      (data || []).map((item: DataRow, idx: number) => ({
        id: idx + 1,
        ...item,
      }))
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2} className="w-full h-full flex flex-col">
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          QUẢN LÝ LỊCH SỬ THAO TÁC NGƯỜI DÙNG
        </Typography>

        {/* Filter/Search Bar */}
        <Box display="flex" gap={2} mb={2}>
          <DatePicker
            label="Từ ngày"
            format="dd/MM/yyyy"
            value={searchTuNgay}
            onChange={(value) => setSearchTuNgay(value as Date)}
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
          <DatePicker
            label="Đến ngày"
            format="dd/MM/yyyy"
            value={searchDenNgay}
            onChange={(value) => setSearchDenNgay(value as Date)}
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleSearch}>
            Làm mới
          </Button>
        </Box>

        {/* Main Content Area (Padding around the table) */}
        <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
          <DataGrid
            rows={mockData}
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
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
