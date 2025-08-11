// src/app/muon-tra-hsba/components/ls-muon-tra-hsba.tsx
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
  Select,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Clear } from "@mui/icons-material";

// Dữ liệu mock cho bảng lịch sử
const historyData = [
  {
    stt: 1,
    thaoTac: "TRẢ BA",
    ngayThucHien: "29/07/2025 14:07:17",
    nguoiMuon: "",
    ngayTra: "",
  },
  {
    stt: 2,
    thaoTac: "MƯỢN BA",
    ngayThucHien: "29/07/2025 14:06:17",
    nguoiMuon: "72001.ADMIN-Admin Trung tâm Y tế Thành phố Tây Ninh",
    ngayTra: "30/07/2025",
  },
];

interface LsMuonTraHsbaProps {
  open: boolean;
  onClose: () => void;
}

const LsMuonTraHsba: React.FC<LsMuonTraHsbaProps> = ({ open, onClose }) => {
  const [thaoTac, setThaoTac] = useState("Tất cả");
  const [nguoiMuon, setNguoiMuon] = useState("");
  const [ngayTra, setNgayTra] = useState("");

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
          LỊCH SỬ MƯỢN TRẢ HSBA
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
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>STT</TableCell>
                <TableCell>Thao tác</TableCell>
                <TableCell>Ngày thực hiện</TableCell>
                <TableCell>Người mượn</TableCell>
                <TableCell>Ngày trả</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={thaoTac}
                      onChange={(e) => setThaoTac(e.target.value as string)}
                      displayEmpty>
                      <MenuItem value="Tất cả">Tất cả</MenuItem>
                      <MenuItem value="MƯỢN BA">MƯỢN BA</MenuItem>
                      <MenuItem value="TRẢ BA">TRẢ BA</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <TextField
                      type="date"
                      variant="outlined"
                      size="small"
                      placeholder="mm/dd/yyyy"
                      defaultValue="2025-07-29"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="date"
                      variant="outlined"
                      size="small"
                      placeholder="mm/dd/yyyy"
                      defaultValue="2025-07-29"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Tìm"
                    value={nguoiMuon}
                    onChange={(e) => setNguoiMuon(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Tìm"
                    value={ngayTra}
                    onChange={(e) => setNgayTra(e.target.value)}
                  />
                </TableCell>
              </TableRow>
              {historyData.map((row) => (
                <TableRow key={row.stt}>
                  <TableCell>{row.stt}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.thaoTac}
                      color={row.thaoTac === "TRẢ BA" ? "warning" : "success"}
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.ngayThucHien}</TableCell>
                  <TableCell>{row.nguoiMuon}</TableCell>
                  <TableCell>{row.ngayTra}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="warning"
            onClick={onClose}
            startIcon={<Clear />}
            sx={{
              padding: "8px 24px",
              fontWeight: "bold",
            }}>
            ĐÓNG
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LsMuonTraHsba;
