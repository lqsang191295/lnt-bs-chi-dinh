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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { NoteAdd } from "@mui/icons-material";

// Dữ liệu mock cho bảng
const patientData = [
  {
    stt: 1,
    hoVaTen: "NGUYỄN THỊ KIM HƯƠNG",
    maBenhAn: "BA2507290175",
    ngayVaoVien: "29/07/2025",
    ngayRaVien: "",
    khoaDieuTri: "Khoa Khám bệnh - Liên chuyên khoa",
  },
];

const peopleToBorrow = ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"];

interface DsMuonHsbaProps {
  open: boolean;
  onClose: () => void;
}

const DsMuonHsba: React.FC<DsMuonHsbaProps> = ({ open, onClose }) => {
  const [nguoiMuon, setNguoiMuon] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const handleMuonHsba = () => {
    // Xử lý logic khi mượn hồ sơ bệnh án
    console.log("Mượn HSBA:", {
      nguoiMuon,
      ghiChu,
    });
    // Sau khi xử lý, có thể đóng dialog
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
          DANH SÁCH MƯỢN HSBA
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
                <TableCell>Stt</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Mã bệnh án</TableCell>
                <TableCell>Ngày vào viện</TableCell>
                <TableCell>Ngày ra viện</TableCell>
                <TableCell>Khoa điều trị</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patientData.map((row) => (
                <TableRow key={row.stt}>
                  <TableCell component="th" scope="row">
                    {row.stt}
                  </TableCell>
                  <TableCell>{row.hoVaTen}</TableCell>
                  <TableCell>{row.maBenhAn}</TableCell>
                  <TableCell>{row.ngayVaoVien}</TableCell>
                  <TableCell>{row.ngayRaVien}</TableCell>
                  <TableCell>{row.khoaDieuTri}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="delete" size="small" color="error">
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3 }} className="w-full flex gap-4">
          <Box className="flex-1 flex items-center gap-2">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Thời gian mượn:
              </Typography>
            </Box>
            <Box className="flex-1">
              <TextField
                type="date"
                variant="outlined"
                size="small"
                fullWidth
                defaultValue="2025-07-29"
              />
            </Box>
          </Box>
          <Box className="flex-1 flex items-center gap-2">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Người mượn (<span style={{ color: "red" }}>*</span>):
              </Typography>
            </Box>
            <Box className="flex-1">
              <FormControl size="small" className="w-full">
                <InputLabel>Chọn người cho mượn</InputLabel>
                <Select
                  value={nguoiMuon}
                  onChange={(e) => setNguoiMuon(e.target.value as string)}
                  fullWidth
                  size="small"
                  label="Chọn người cho mượn">
                  {peopleToBorrow.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }} className="w-full flex gap-4">
          <Box className="flex-1 flex items-center gap-2">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Thời gian trả (<span style={{ color: "red" }}>*</span>):
              </Typography>
            </Box>
            <Box className="flex-1">
              <TextField
                type="date"
                variant="outlined"
                size="small"
                fullWidth
                defaultValue="2025-07-29"
              />
            </Box>
          </Box>
          <Box className="flex-1 flex items-center gap-2">
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Ghi chú:
              </Typography>
            </Box>
            <Box className="flex-1">
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleMuonHsba}
            startIcon={<NoteAdd />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              padding: "8px 24px",
            }}>
            MƯỢN HSBA (F3)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DsMuonHsba;
