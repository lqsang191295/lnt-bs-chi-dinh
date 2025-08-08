 
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
import { Grid } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react"; 
import { gettnhatkynguoidung } from "@/actions/emr_tnguoidung";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT  
import { get } from "@/api/client";

export default function NhatKyNguoiDungPage() {
  const columns: GridColDef[] = [
    { field: "cid", headerName: "ID", width: 60 },    
    { field: "ctaikhoan", headerName: "Tài khoản", width: 150, filterable: true  },
    { field: "choten", headerName: "Họ tên", width: 150 , filterable: true },
    { field: "cdienthoai", headerName: "Điện thoại", width: 130 , filterable: true },
    { field: "tngaythaotac", headerName: "Ngày thao tác", width: 180 , filterable: true },
    { field: "cthaotac", headerName: "Thao tác", width: 100 , filterable: true},
    { field: "cnoidung", headerName: "Nội dung", width: 400},
  ];
 
  // State variables
   
  const { data: loginedUser, setUserData} = useUserStore();  
  const [tuNgay, setTuNgay] = useState<Date | null>(new Date());
  const [denNgay, setDenNgay] = useState<Date | null>(new Date());
  const [rows, setRows] = useState<any[]>([]);
  const [popt, setPopt] = useState("1"); // 1: Ngày vào viện, 2: Ngày ra viện

  // Fetch khoa list from API
   
  // Hàm tìm kiếm hồ sơ bệnh án
  const handleSearch = async () => {
    if (!tuNgay || !denNgay) return;
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }; 
    const data = await gettnhatkynguoidung(loginedUser.ctaikhoan, popt, formatDate(tuNgay), formatDate(denNgay));
     
    setRows(
      (data || []).map((item: any, idx: number) => ({
        id: idx + 1,
        ...item,
      }))
    );
    //console.log("Search results:", data);
  };
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
    }, []);
    
  // Render component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          NHẬT KÝ NGƯỜI DÙNG
        </Typography>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={2}>
            <DatePicker
              label="Từ ngày"
              value={tuNgay}
              onChange={(value) => setTuNgay(value as Date)}
              format="dd/MM/yyyy"
            />
          </Box>
          <Box flex={2}>
            <DatePicker
              label="Đến ngày"
              value={denNgay}
              onChange={(value) => setDenNgay(value as Date)}
              format="dd/MM/yyyy"
            />
          </Box>
          <Box flex={2}>
            <Button fullWidth variant="contained" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: 550, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 20, 50]}
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