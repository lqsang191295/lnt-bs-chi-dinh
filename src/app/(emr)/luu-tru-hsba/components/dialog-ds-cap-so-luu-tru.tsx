"use client";

import CloseIcon from "@mui/icons-material/Close";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

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

const DialogCapNhatSoLuuTru: React.FC<CapNhatViTriProps> = ({
  open,
  onClose,
}) => {
  const [viTriLuuTru, setViTriLuuTru] = useState("");

  const handleUpdate = () => {
    // Logic để cập nhật vị trí lưu trữ
    console.log("Cập nhật vị trí lưu trữ:", {
      viTriLuuTru,
    });
    // Đóng dialog sau khi xử lý
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h6" component="div">
          DANH SÁCH CẤP SỐ LƯU TRỮ
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Typography variant="subtitle1" fontWeight="bold">
                Thời gian:
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1">29/07/2025 14:02:43</Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1" fontWeight="bold">
                Người xử lý:
              </Typography>
            </Grid>
            <Grid>
              <Typography variant="subtitle1">
                Admin Trung tâm Y tế Thành phố Tây Ninh
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Vị trí lưu trữ (<span style={{ color: "red" }}>*</span>):
          </Typography>
          <TextField
            multiline
            rows={4}
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
            startIcon={<DriveFileMoveIcon />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              padding: "8px 24px",
            }}>
            CẬP NHẬT VỊ TRÍ LƯU TRỮ
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DialogCapNhatSoLuuTru);
