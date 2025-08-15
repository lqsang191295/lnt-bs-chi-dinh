// src/app/muon-tra-hsba/components/ds-muon-hsba.tsx
"use client";

import { NoteAdd } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState ,useEffect} from "react";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { useUserStore } from "@/store/user";
import { gettnguoidung } from "@/actions/emr_tnguoidung";
import { IUserItem } from "@/model/user";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { log } from "console";

interface DsMuonHsbaProps {
  loai: string; // Loại mượn ( "MUON" hoặc "TRA")
  phieumuon: ITMuonTraHSBA | null; // Dữ liệu phiếu mượn trả
  open: boolean;
  onClose: () => void;
  selectedHsbaForDetail: IHoSoBenhAn | null;
}

const DsMuonHsba: React.FC<DsMuonHsbaProps> = ({ loai, phieumuon, open, onClose , selectedHsbaForDetail }) => {

  
  const { data: loginedUser, setUserData } = useUserStore();
  const [nguoiMuon, setNguoiMuon] = useState<IUserItem[]>([]);
// Form data for dialog 
  const [formData, setFormData] = useState({
    puser: loginedUser?.ctaikhoan || "", // Tài khoản người dùng hiện tại
    popt: loai === "MUON" ? "1" : "2", // 1: insert, 2: update
    cid: phieumuon?.cid || "", // chỉ dùng khi update
    cmabenhan: selectedHsbaForDetail?.ID || "", // ID của hồ sơ bệnh án
    cthaotac: loai, // "MUON" hoặc "TRA"
    cngaymuon: phieumuon?.cngaythaotac || new Date(), // Ngày mượn
    cnguoithaotac: loginedUser?.ctaikhoan || "",
    cngaytradukien: phieumuon?.cngaytradukien || new Date(),
    cnguoimuon: phieumuon?.cnguoimuon || "", // Tài khoản người mượn
    cghichumuon: phieumuon?.cghichumuon || "", // Ghi chú mượn
    cngaytra: phieumuon?.cngaytra || null, // Ngày trả thực tế
    cghichutra: phieumuon?.cghichutra || "", // Ghi chú trả
  });
  const handleMuonHsba = () => {
    // Xử lý logic khi mượn hồ sơ bệnh án
    // goi API hoặc thực hiện luu trữ dữ liệu
    console.log("Mượn HSBA:", {
      ...formData, 
      NgayTra: formData.cngaytradukien ? formData.cngaytradukien : null,
      HoSoBenhAnId: selectedHsbaForDetail?.ID, // ID của hồ sơ bệnh án được mượn
      NguoiMuon: formData.cnguoimuon,
      GhiChu: formData.cghichumuon,
    });
    // Sau khi xử lý, có thể đóng dialog
    onClose();
  };
// Fetch khoa list from API
  useEffect(() => {
    // if (!loginedUser || !loginedUser.ctaikhoan) {
    //   router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
    //   return;
    // }
    
    async function fetchNguoimuon() {
      if (!loginedUser || !loginedUser.ctaikhoan) return;
      const result = await gettnguoidung(loginedUser.ctaikhoan, "2");
      if (Array.isArray(result)) {
        setNguoiMuon(result as IUserItem[]); 
      }
    }
    fetchNguoimuon();
    
  }, []);
  return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          THÔNG TIN MƯỢN TRẢ HỒ SƠ BỆNH ÁN
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
        <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
              {/* Khung thông tin chỉ xem */}
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: 2,
                  backgroundColor: "#f9f9f9",
                }}>
                {/* <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Thông tin hồ sơ bệnh án
                </Typography> */}

                {/* ID */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="ID"
                    value={selectedHsbaForDetail?.ID}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>

                {/* Số vào viện, Ngày vào viện, Ngày ra viện - cùng 1 hàng */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Số vào viện"
                    value={selectedHsbaForDetail?.SoVaoVien}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày vào viện"
                    value={selectedHsbaForDetail?.NgayVao ? selectedHsbaForDetail?.NgayVao : ""}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày ra viện"
                    value={selectedHsbaForDetail?.NgayRa ? selectedHsbaForDetail?.NgayRa : ""}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                </Box>

                {/* Họ tên, Ngày sinh, Giới tính - cùng 1 hàng */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Họ và tên"
                    value={selectedHsbaForDetail?.Hoten}
                    size="small"
                    sx={{ flex: 2, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Ngày sinh"
                    value={selectedHsbaForDetail?.Ngaysinh}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Giới tính"
                    value={selectedHsbaForDetail?.Gioitinh}
                    size="small"
                    sx={{ flex: 1, backgroundColor: "white" }}
                  />
                </Box>

                {/* Địa chỉ */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Địa chỉ"
                    value={selectedHsbaForDetail?.Diachi}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>

                {/* Khoa điều trị */}
                <Box>
                  <TextField
                    InputProps={{ readOnly: true }}
                    label="Khoa điều trị"
                    value={selectedHsbaForDetail?.KhoaDieuTri}
                    fullWidth
                    size="small"
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>
              </Box>

              {/* Khung thông tin cập nhật */}
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Khung thông tin mượn */}
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #1976d2",
                    borderRadius: "8px",
                    padding: 2,
                    backgroundColor: "#f3f7ff",
                  }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                    Thông tin mượn
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <DateTimePicker
                      label="Ngày mượn"
                      value={formData.cngaymuon}
                      onChange={(value) =>
                        setFormData({ ...formData, cngaymuon: value as Date })
                      }
                      format="dd/MM/yyyy HH:mm:ss"
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: { backgroundColor: "white" },
                        },
                      }}
                    />
                    <DateTimePicker
                      label="Ngày trả dự kiến"
                      value={formData.cngaytradukien}
                      onChange={(value) =>
                        setFormData({ ...formData, cngaytradukien: value as Date })
                      }
                      format="dd/MM/yyyy HH:mm:ss"
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: { backgroundColor: "white" },
                        },
                      }}
                    />
                    <Box className="flex flex-col gap-2">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Người mượn (<span style={{ color: "red" }}>*</span>):
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Chọn người mượn</InputLabel>
                        <Select
                          value={formData.cnguoimuon}
                          onChange={(e) => setFormData({ ...formData, cnguoimuon: e.target.value })} 
                          fullWidth
                          size="small"
                          label="Chọn người mượn"
                          sx={{ backgroundColor: "white" }}>
                          {nguoiMuon.map((user) => (
                            <MenuItem key={user.ctaikhoan} value={user.ctaikhoan}>
                              {user.cid} - {user.choten}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box className="flex flex-col gap-2">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Ghi chú mượn:
                      </Typography>
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.cghichumuon}
                        onChange={(e) => setFormData({ ...formData, cghichumuon: e.target.value })}
                        sx={{ backgroundColor: "white" }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Khung thông tin trả */}
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid #4caf50",
                    borderRadius: "8px",
                    padding: 2,
                    backgroundColor: "#f1f8e9",
                  }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#4caf50", fontWeight: "bold" }}>
                    Thông tin trả
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    

                    <DateTimePicker
                      label="Ngày trả"
                      value={formData.cngaytra || null}
                      onChange={(value) =>
                        setFormData({ ...formData, cngaytra: value as Date })
                      }
                      format="dd/MM/yyyy HH:mm:ss"
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          sx: { backgroundColor: "white" },
                        },
                      }}
                    />
                    
                    <Box className="flex flex-col gap-2">
                      <Typography variant="subtitle2" fontWeight="bold">
                        Ghi chú trả:
                      </Typography>
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.cghichutra || ""}
                        onChange={(e) => setFormData({ ...formData, cghichutra: e.target.value })}
                        sx={{ backgroundColor: "white" }}
                      />
                    </Box>
                  </Box>
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
            {loai==="MUON"?"MƯỢN +":"TRẢ +"} HSBA (F3)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    </LocalizationProvider>
  );
};

export default DsMuonHsba;
