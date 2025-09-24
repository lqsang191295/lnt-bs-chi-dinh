// src/app/nhat-ky-nguoi-dung/page.tsx
"use client";

import { gettnhatkynguoidung } from "@/actions/act_tnguoidung";
import HeadMetadata from "@/components/HeadMetadata";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { useUserStore } from "@/store/user";
import { useMenuStore } from "@/store/menu";
import { ToastError } from "@/utils/toast";
import { Refresh, Search } from "@mui/icons-material";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [searchTuNgay, setSearchTuNgay] = useState<Date | null>(new Date());
  const [searchDenNgay, setSearchDenNgay] = useState<Date | null>(new Date());
  const [mockData, setRows] = React.useState<DataRow[]>([]); // Dữ liệu bảng
  const [searchingData, setSearchingData] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "nhat-ky-nguoi-dung" không
      if (menuData.find((item) => item.clink === "nhat-ky-nguoi-dung")) {
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
    
    // Logic lọc dữ liệu mockData
    if (!searchTuNgay || !searchDenNgay) return;
    
    try {
      setSearchingData(true);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      
      const data = await gettnhatkynguoidung(
        loginedUser.ctaikhoan,
        "1",
        formatDate(searchTuNgay),
        formatDate(searchDenNgay)
      );

      setRows(
        (data || []).map((item: DataRow) => ({
          id: item.cid,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      ToastError("Lỗi khi tìm kiếm nhật ký người dùng!");
    } finally {
      setSearchingData(false);
    }
  };

  const handleRefresh = () => {
    if (!hasAccess) return;
    
    // console.log("Refresh clicked!");
    // Reset dữ liệu
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
        title="BẠN KHÔNG CÓ QUYỀN XEM NHẬT KÝ NGƯỜI DÙNG"
        message="Bạn không có quyền truy cập chức năng nhật ký người dùng. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Quản lý lịch sử thao tác người dùng" />

      {/* Container chính với height cố định */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 64px)', // Trừ height của header/navbar
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 2
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
          QUẢN LÝ LỊCH SỬ THAO TÁC NGƯỜI DÙNG
        </Typography>

        {/* Filter/Search Bar */}
        <Box 
          display="flex" 
          gap={2} 
          sx={{ 
            flexShrink: 0,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
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
            onClick={handleSearch}
            disabled={searchingData}
          >
            {searchingData ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Làm mới
          </Button>
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
            pagination
            checkboxSelection
            disableRowSelectionOnClick
            density="compact"
            loading={searchingData}
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