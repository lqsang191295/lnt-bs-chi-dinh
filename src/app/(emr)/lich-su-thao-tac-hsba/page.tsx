// app/lich-su-thao-tac-hsba/page.tsx
"use client";

import { Box, Button, Typography, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from "react";

import { getnhatkythaotacba } from "@/actions/act_thosobenhan";
import HeadMetadata from "@/components/HeadMetadata";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { useUserStore } from "@/store/user";
import { useMenuStore } from "@/store/menu";
import { Refresh, Search } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ToastError } from "@/utils/toast";
import { useRouter } from "next/navigation";

// Dữ liệu cứng cho bảng
interface DataRow {
  cid: string;
  ctaikhoan: string;
  choten: string;
  cdienthoai: string;
  cmabenhan: string;
  MaBN: string;
  Hoten: string;
  SoVaoVien: string;
  SoLuuTru: string;
  KhoaDieuTri: string;
  cthaotac: string;
  cgiatricu: string;
  cgiatrimoi: string;
  tngaythaotac: string;
}

const columns: GridColDef[] = [
  { field: "cid", headerName: "ID", width: 60 },
  { field: "ctaikhoan", headerName: "Tài khoản", width: 100, filterable: true },
  { field: "choten", headerName: "Họ tên", width: 150, filterable: true },
  {
    field: "cdienthoai",
    headerName: "Điện thoại",
    width: 100,
    filterable: true,
  },
  { field: "cthaotac", headerName: "Thao tác", width: 200, filterable: true },
  {
    field: "tngaythaotac",
    headerName: "Ngày thao tác",
    width: 180,
    filterable: true,
  },
  { field: "cgiatricu", headerName: "Giá trị cũ", width: 200 },
  { field: "cgiatrimoi", headerName: "Giá trị mới", width: 200 },
  {
    field: "cmabenhan",
    headerName: "Mã bệnh án",
    width: 130,
    filterable: true,
  },
  { field: "MaBN", headerName: "Mã bệnh nhân", width: 130, filterable: true },
  { field: "Hoten", headerName: "Tên bệnh nhân", width: 130, filterable: true },
  {
    field: "SoVaoVien",
    headerName: "Số vào viện",
    width: 130,
    filterable: true,
  },
  { field: "SoLuuTru", headerName: "Số lưu trữ", width: 130, filterable: true },
  {
    field: "KhoaDieuTri",
    headerName: "Khoa điều trị",
    width: 130,
    filterable: true,
  },
];

export default function LichSuThaoTacHsbaPage() {
  const router = useRouter();
  const [searchFromDate, setSearchFromDate] = React.useState("");
  const [searchToDate, setSearchToDate] = React.useState("");

  // State cho các ô tìm kiếm trong tiêu đề cột
  const [colSearchMaBenhAn, setColSearchMaBenhAn] = React.useState("");
  const [colSearchThoiGian, setColSearchThoiGian] = React.useState("");
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [mockData, setRows] = React.useState<DataRow[]>([]); // Dữ liệu bảng
  // State và hàm cho Pagination
  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
  const [popt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện
  const [searchingData, setSearchingData] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "lich-su-thao-tac-hsba" không
      if (menuData.find((item) => item.clink === "lich-su-thao-tac-hsba")) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
        // Không redirect, chỉ set hasAccess = false để hiển thị AccessDeniedPage
      }
      setIsCheckingAccess(false);
    };

    // Chỉ kiểm tra khi đã có dữ liệu từ store
    if (loginedUser && menuData !== undefined) {
      checkAccess();
    }
  }, [menuData, loginedUser, router]);

  const handleSearch = async () => {
    if (!hasAccess) return;
    
    try {
      console.log("Searching with:", {
        searchFromDate,
        searchToDate,
        colSearchMaBenhAn,
        colSearchThoiGian,
        // ... (thêm các trường tìm kiếm cột khác nếu cần)
      });
      // Logic lọc dữ liệu mockData dựa trên các trường tìm kiếm
      // Logic lọc dữ liệu mockData
      if (!searchTuNgay || !searchDenNgay) return;

      setSearchingData(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const data = await getnhatkythaotacba(
        loginedUser.ctaikhoan,
        popt,
        formatDate(searchTuNgay),
        formatDate(searchDenNgay)
      );

      console.log("Search results: -----------", data);

      setRows(
        (data || []).map((item: DataRow) => ({
          id: item.cid,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching history data:", error);
      ToastError("Lỗi khi tìm kiếm lịch sử thao tác!");
    } finally {
      setSearchingData(false);
    }
  };

  const handleRefresh = () => {
    if (!hasAccess) return;
    
    console.log("Refresh clicked!");
    // Reset tất cả các trường tìm kiếm
    setSearchFromDate("");
    setSearchToDate("");
    setColSearchMaBenhAn("");
    setColSearchThoiGian("");
    setRows([]);
  };

  // Hiển thị loading khi đang kiểm tra quyền truy cập
  if (isCheckingAccess) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography color="textSecondary">Đang kiểm tra quyền truy cập...</Typography>
      </Box>
    );
  }

  // Hiển thị trang Access Denied nếu không có quyền
  if (!hasAccess) {
    return (
      <AccessDeniedPage
        title="BẠN KHÔNG CÓ QUYỀN XEM LỊCH SỬ THAO TÁC"
        message="Bạn không có quyền truy cập chức năng lịch sử thao tác hồ sơ bệnh án. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Lịch sử thao tác hồ sơ bệnh án" />

      {/* Container chính với height cố định */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 64px)', // Trừ height của header/navbar
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1
        }}
      >
        <Typography
          variant="h6"
          sx={{ 
            color: "#1976d2", 
            fontWeight: "bold", 
            letterSpacing: 1,
            flexShrink: 0
          }}
        >
          QUẢN LÝ LỊCH SỬ THAO TÁC BỆNH ÁN
        </Typography>

        {/* Bộ lọc */}
        <Box 
          display="flex" 
          gap={2} 
          sx={{ 
            flexShrink: 0,
            flexWrap: 'wrap'
          }}
        >
          <Box flex={2}>
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
          </Box>
          <Box flex={2}>
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
          </Box>
          <Box flex={1}>
            <Button
              fullWidth
              startIcon={<Search />}
              variant="contained"
              size="small"
              onClick={handleSearch}
              disabled={searchingData}>
              {searchingData ? "Đang tìm..." : "Tìm kiếm"}
            </Button>
          </Box>
          <Box flex={1}>
            <Button
              fullWidth
              startIcon={<Refresh />}
              variant="contained"
              size="small"
              onClick={handleRefresh}>
              Làm mới
            </Button>
          </Box>
        </Box>

        {/* Main Content Area - DataGrid với height cố định */}
        <Box 
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 400, // Đảm bảo có chiều cao tối thiểu
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <DataGrid
            rows={mockData}
            columns={columns}
            loading={searchingData}
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            sx={{
              height: '100%',
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
              '& .MuiDataGrid-main': {
                overflow: 'hidden'
              }
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}