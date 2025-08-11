"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit"; // Thêm icon Edit

// Dữ liệu mock cho bảng thông tin bệnh án
const patientData = [
  {
    hoVaTen: "ABC TEST",
    maBenhAn: "BA25000998",
    ngayVaoVien: "17/05/2025",
    ngayRaVien: "17/05/2025",
    khoaDieuTri: "Khoa Nội tổng hợp - Nhi - Nhiễm",
  },
];

interface CapNhatViTriProps {
  open: boolean;
  onClose: () => void;
}

const DialogPhanLoaiLuuTru: React.FC<CapNhatViTriProps> = ({
  open,
  onClose,
}) => {
  const [viTriLuuTru, setViTriLuuTru] = useState("");

  const handleUpdate = () => {
    // Logic để cập nhật vị trí lưu trữ
    console.log("Cập nhật vị trí lưu trữ:", {
      viTriLuuTru,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          backgroundColor: "#1976d2", // Màu nền xanh đậm
          color: "white", // Chữ trắng
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          CẬP NHẬT VỊ TRÍ LƯU TRỮ BỆNH ÁN
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "white",
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Mã bệnh án</TableCell>
                <TableCell>Ngày vào viện</TableCell>
                <TableCell>Ngày ra viện</TableCell>
                <TableCell>Khoa điều trị</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientData.map((row) => (
                <TableRow key={row.maBenhAn}>
                  <TableCell>{row.hoVaTen}</TableCell>
                  <TableCell>{row.maBenhAn}</TableCell>
                  <TableCell>{row.ngayVaoVien}</TableCell>
                  <TableCell>{row.ngayRaVien}</TableCell>
                  <TableCell>{row.khoaDieuTri}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ color: "#1976d2" }}>
                Thời gian:
              </Typography>
              <TextField
                value="29/07/2025 14:02:43"
                fullWidth
                disabled
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ color: "#1976d2" }}>
                Người xử lý:
              </Typography>
              <TextField
                value="Admin Trung tâm Y tế Thành phố Tây Ninh"
                fullWidth
                disabled
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#1976d2" }}>
            Vị trí lưu trữ (<span style={{ color: "red" }}>*</span>):
          </Typography>
          <TextField
            multiline
            rows={3} // Điều chỉnh số dòng
            variant="outlined"
            size="small"
            fullWidth
            value={viTriLuuTru}
            onChange={(e) => setViTriLuuTru(e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleUpdate}
            startIcon={<EditIcon />} // Icon Edit
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              fontWeight: "bold",
              padding: "8px 24px",
            }}>
            CẬP NHẬT VỊ TRÍ LƯU TRỮ
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPhanLoaiLuuTru;
