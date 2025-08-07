 
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
import { gettnhatkynguoidung } from "@/actions/emr_tnguoidung";
import { useUserStore } from "@/store/user";
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
  
  const { data: loginedUser } = useUserStore(); 
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
  // Render component
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
          NHẬT KÝ NGƯỜI DÙNG
        </Typography>
        <Grid container spacing={2} mb={2}>   
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
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
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