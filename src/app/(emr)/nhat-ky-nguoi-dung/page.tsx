// src/app/nhat-ky-nguoi-dung/page.tsx
"use client";

import { gettnhatkynguoidung } from "@/actions/emr_tnguoidung";
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
export default function nhatkynguoidungPage() {
  const [currentTab, setCurrentTab] = React.useState("export");
  const [searchTerm, setSearchTerm] = React.useState(""); // Tên tài liệu
  const [searchStatus, setSearchStatus] = React.useState(""); // Tình trạng xét xuất
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [searchDateType, setSearchDateType] = React.useState("ngayVaoVien"); // Default search by "Ngày vào viện"
  const [mockData, setRows] = React.useState<DataRow[]>([]); // Dữ liệu bảng
  // State và hàm cho Pagination
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const { data: loginedUser } = useUserStore();
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

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
      (data || []).map((item: any, idx: number) => ({
        id: idx + 1,
        ...item,
      }))
    );
  };

  const handleRefresh = () => {
    console.log("Refresh clicked!");
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = mockData.map((n) => n.cid);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Lấy dữ liệu cho trang hiện tại
  const paginatedData = mockData.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(mockData.length / rowsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset về trang 1 khi thay đổi số hàng mỗi trang
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
