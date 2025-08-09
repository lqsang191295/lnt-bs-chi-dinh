"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Select,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// ----------------- MOCK DATA -----------------
interface DataRow {
  id: string;
  trangThaiMuon: "CHƯA MƯỢN" | "ĐANG MƯỢN";
  loaiBaSoTo: string;
  maBenhAn: string;
  hoVaTen: string;
  tuoi: string;
  ngayVaoVien: string;
  ngayRaVien: string;
  chanDoan: string;
  khoa: string;
}

const mockData: DataRow[] = [
  {
    id: "1",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000645B",
    maBenhAn: "BA2507290175",
    hoVaTen: "NGUYỄN THỊ KIM HƯƠNG",
    tuoi: "33 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "2",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN0037234",
    maBenhAn: "BA2507290174",
    hoVaTen: "NGUYỄN THỊ THU",
    tuoi: "60 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "3",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN003824B5",
    maBenhAn: "BA2507290173",
    hoVaTen: "NGUYỄN THỊ LỆ THU",
    tuoi: "68 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "4",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00331862",
    maBenhAn: "BA2507290171",
    hoVaTen: "DƯƠNG THỊ THÙY LAN",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Y học cổ truyền và Phục hồi chức năng",
  },
  {
    id: "5",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00317513",
    maBenhAn: "BA2507290170",
    hoVaTen: "PHẠM THỊ HỒNG NGA",
    tuoi: "50 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "6",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN0038380",
    maBenhAn: "BA2507290169",
    hoVaTen: "NGUYỄN CAO LỰC",
    tuoi: "20 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "7",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN003557B9",
    maBenhAn: "BA2507290167",
    hoVaTen: "VÕ ĐỖ THỊ THƠ",
    tuoi: "31 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "8",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00322475",
    maBenhAn: "BA2507290166",
    hoVaTen: "VÕ XUÂN CHÍNH",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "9",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN00302331",
    maBenhAn: "BA2507290165",
    hoVaTen: "HUỲNH CÔNG HẢO",
    tuoi: "71 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "29/07/2025",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000656B3",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    tuoi: "53 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000656B3",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    tuoi: "53 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000656B3",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    tuoi: "53 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
  {
    id: "10",
    trangThaiMuon: "CHƯA MƯỢN",
    loaiBaSoTo: "BN000656B3",
    maBenhAn: "BA2507290164",
    hoVaTen: "NGUYỄN HOÀNG LƯƠNG",
    tuoi: "53 Tuổi",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    chanDoan: "",
    khoa: "Khoa Khám bệnh - Liên chuyên khoa",
  },
];

// ----------------- COMPONENT -----------------
export default function BorrowReturnPage() {
  const [currentTab, setCurrentTab] = useState("borrow");
  const [searchTerm, setSearchTerm] = useState("");

  // Cột cho DataGrid
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 60 },
    {
      field: "trangThaiMuon",
      headerName: "Trạng thái",
      width: 100,
      renderCell: (params) => {
        const isChuaMuon = params.value === "CHƯA MƯỢN";
        return (
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: isChuaMuon ? "#28a745" : "#dc3545",
              color: "#fff",
              textTransform: "none",
              minWidth: "60px",
              height: "24px",
              fontSize: "0.7rem",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: isChuaMuon ? "#28a745" : "#dc3545",
                opacity: 0.9,
              },
            }}>
            {isChuaMuon ? "MƯỢN" : "TRẢ"}
          </Button>
        );
      },
    },
    { field: "loaiBaSoTo", headerName: "Số lưu trữ", width: 120 },
    { field: "maBenhAn", headerName: "Mã BA", width: 150 },
    { field: "hoVaTen", headerName: "Họ và tên", width: 200 },
    { field: "tuoi", headerName: "Tuổi", width: 90 },
    { field: "ngayVaoVien", headerName: "Ngày vào viện", width: 130 },
    { field: "ngayRaVien", headerName: "Ngày ra viện", width: 130 },
    { field: "chanDoan", headerName: "Chẩn đoán", width: 200 },
    { field: "khoa", headerName: "Khoa", width: 250 },
  ];

  // Rows: dùng luôn mockData vì đã trùng key với field trong columns
  const rows = mockData;

  return (
    <Box p={2} className="w-full h-full flex flex-col">
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
        QUẢN LÝ MƯỢN TRẢ HỒ SƠ BỆNH ÁN
      </Typography>

      {/* Bộ lọc */}
      <Box display="flex" gap={2} mb={2}>
        <Box flex={3}>
          <Select fullWidth size="small"></Select>
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
              name="popt-radio-group">
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
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
              },
            }}
          />
        </Box>
        <Box flex={1}>
          <Button fullWidth variant="contained">
            Tìm kiếm
          </Button>
        </Box>
      </Box>

      <TextField
        label="Tên tài liệu"
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton edge="end" size="small">
              <SearchIcon />
            </IconButton>
          ),
        }}
      />

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          bgcolor: "#f5f5f5",
          mt: 2,
        }}>
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          aria-label="borrow return tabs">
          <Tab
            label="MƯỢN HSBA"
            value="borrow"
            sx={{ textTransform: "none" }}
          />
          <Tab label="TRẢ HSBA" value="return" sx={{ textTransform: "none" }} />
          <Tab
            label="LỊCH SỬ MƯỢN TRẢ"
            value="history"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#28a745",
            "&:hover": {
              bgcolor: "#218838",
            },
            color: "#fff",
            textTransform: "none",
            ml: 2,
          }}>
          LÀM MỚI (F5)
        </Button>
      </Box>

      {/* DataGrid */}
      <Box className="flex-1 w-full h-full overflow-hidden" mt={1}>
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
          }}
        />
      </Box>
    </Box>
  );
}
