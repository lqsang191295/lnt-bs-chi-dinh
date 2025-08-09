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
import ClearIcon from "@mui/icons-material/Clear";
import { Reply } from "@mui/icons-material";

// Dữ liệu mock cho bảng
const patientData = [
  {
    stt: 1,
    hoVaTen: "NGUYỄN THỊ KIM HƯƠNG",
    maBenhAn: "BA2507290175",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    khoaDieuTri: "Khoa Khám bệnh - Liên chuyên khoa",
    nguoiMuon: "Admin Trung tâm Y tế Thành phố Tây Ninh",
    ngayHenTra: "30/07/2025",
  },
];

interface DsTraHsbaProps {
  open: boolean;
  onClose: () => void;
}

const DsTraHsba: React.FC<DsTraHsbaProps> = ({ open, onClose }) => {
  const [ghiChu, setGhiChu] = useState("");

  const handleTraHsba = () => {
    // Logic xử lý khi trả HSBA
    console.log("Trả HSBA:", {
      ghiChu,
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
          DANH SÁCH TRẢ HSBA
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
                <TableCell>STT</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Mã bệnh án</TableCell>
                <TableCell>Ngày vào viện</TableCell>
                <TableCell>Ngày ra viện</TableCell>
                <TableCell>Khoa điều trị</TableCell>
                <TableCell>Người mượn</TableCell>
                <TableCell>Ngày hẹn trả</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientData.map((row) => (
                <TableRow key={row.stt}>
                  <TableCell>{row.stt}</TableCell>
                  <TableCell>{row.hoVaTen}</TableCell>
                  <TableCell>{row.maBenhAn}</TableCell>
                  <TableCell>{row.ngayVaoVien}</TableCell>
                  <TableCell>{row.ngayRaVien}</TableCell>
                  <TableCell>{row.khoaDieuTri}</TableCell>
                  <TableCell>{row.nguoiMuon}</TableCell>
                  <TableCell>{row.ngayHenTra}</TableCell>
                  <TableCell align="center">
                    <IconButton aria-label="clear" size="small">
                      <ClearIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3 }} className="flex gap-4 justify-around">
          <Box className="flex items-center gap-4">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Thời gian:
              </Typography>
            </Box>
            <Box className="flex-1">
              <Typography variant="subtitle1">29/07/2025 14:06:40</Typography>
            </Box>
          </Box>
          <Box className="flex-1 flex items-center gap-4">
            <Box className="flex-1 text-right">
              <Typography variant="subtitle1" fontWeight="bold">
                Người xử lý:
              </Typography>
            </Box>
            <Box className="text-right">
              <Typography variant="subtitle1">
                Admin Trung tâm Y tế Thành phố Tây Ninh
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }} className="flex gap-4">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Ghi chú:
            </Typography>
          </Box>
          <Box className="flex-1">
            <TextField
              multiline
              rows={3}
              variant="outlined"
              size="small"
              fullWidth
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleTraHsba}
            startIcon={<Reply />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              padding: "8px 24px",
            }}>
            TRẢ HSBA (F3)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DsTraHsba;
