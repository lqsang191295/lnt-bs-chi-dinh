"use client";

import { getmuontraHSBA } from "@/actions/act_thosobenhan";
import { ITMuonTraHSBA } from "@/model/tmuontrahsba";
import { useUserStore } from "@/store/user";
import { formatDisplayDate } from "@/utils/timer";
import { Clear, Search } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
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
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface LsMuonTraHsbaProps {
  open: boolean;
  onClose: () => void;
  selectedHsbaId?: string; // Mã bệnh án được chọn từ component cha
}

const LsMuonTraHsba: React.FC<LsMuonTraHsbaProps> = ({
  open,
  onClose,
  selectedHsbaId,
}) => {
  // States
  const [historyData, setHistoryData] = useState<ITMuonTraHSBA[]>([]);
  const [loading, setLoading] = useState(false);
  const [thaoTac, setThaoTac] = useState("Tất cả");
  const [nguoiMuon, setNguoiMuon] = useState("");
  const [ngayTra, setNgayTra] = useState("");

  // Date states
  const [tuNgay, setTuNgay] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 ngày trước
    return date.toISOString().split("T")[0];
  });

  const [denNgay, setDenNgay] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  const { data: loginedUser } = useUserStore();

  // Hàm chuyển đổi date từ yyyy-mm-dd sang dd/MM/yyyy
  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch lịch sử mượn trả
  const fetchLichSuMuonTra = async () => {
    if (!loginedUser?.ctaikhoan) {
      toast.error("Không có thông tin người dùng!");
      return;
    }

    setLoading(true);
    try {
      let result: ITMuonTraHSBA[] = [];

      if (selectedHsbaId) {
        // Lấy theo mã bệnh án cụ thể (pOpt = "1")
        result = (await getmuontraHSBA(
          loginedUser.ctaikhoan,
          "1",
          selectedHsbaId,
          "",
          ""
        )) as ITMuonTraHSBA[];
      } else {
        // Lấy theo khoảng thời gian (pOpt = "2")
        result = (await getmuontraHSBA(
          loginedUser.ctaikhoan,
          "2",
          "",
          formatDateForAPI(tuNgay),
          formatDateForAPI(denNgay)
        )) as ITMuonTraHSBA[];
      }

      console.log("Lich su muon tra result:", result);

      if (Array.isArray(result)) {
        setHistoryData(result);
      } else {
        console.log("Result is not array:", result);
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error fetching lich su muon tra:", error);
      toast.error("Có lỗi khi tải lịch sử mượn trả!");
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect để load data khi dialog mở
  useEffect(() => {
    if (open) {
      fetchLichSuMuonTra();
    }
  }, [open, selectedHsbaId, loginedUser]);

  // Hàm tìm kiếm
  const handleSearch = () => {
    fetchLichSuMuonTra();
  };

  // Hàm reset filter
  const handleReset = () => {
    setThaoTac("Tất cả");
    setNguoiMuon("");
    setNgayTra("");
    const today = new Date().toISOString().split("T")[0];
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    setTuNgay(lastMonth.toISOString().split("T")[0]);
    setDenNgay(today);
  };

  // Filter dữ liệu hiển thị
  const filteredData = historyData.filter((item) => {
    const matchThaoTac = thaoTac === "Tất cả" || item.cthaotac === thaoTac;
    const matchNguoiMuon =
      !nguoiMuon ||
      (item.cnguoimuon &&
        item.cnguoimuon.toLowerCase().includes(nguoiMuon.toLowerCase()));
    const matchNgayTra =
      !ngayTra ||
      (item.cngaytra && formatDisplayDate(item.cngaytra).includes(ngayTra));

    return matchThaoTac && matchNguoiMuon && matchNgayTra;
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1976d2",
          color: "white",
        }}>
        <Typography variant="h6" component="div">
          LỊCH SỬ MƯỢN TRẢ HSBA
          {selectedHsbaId && (
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Mã bệnh án: {selectedHsbaId}
            </Typography>
          )}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Filter Section */}
        {!selectedHsbaId && (
          <Box
            sx={{ mb: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Tìm kiếm theo thời gian:
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}>
              <TextField
                label="Từ ngày"
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                disabled={loading}
                sx={{ minWidth: 100 }}>
                Tìm kiếm
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}>
                Reset
              </Button>
            </Box>
          </Box>
        )}

        {/* Table */}
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", width: 80 }}>
                  STT
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 120 }}>
                  Thao tác
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 180 }}>
                  Ngày thực hiện
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Người mượn</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 150 }}>
                  Ngày trả dự kiến
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 150 }}>
                  Ngày trả thực tế
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 100 }}>
                  Trạng thái
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Filter Row */}
              <TableRow sx={{ backgroundColor: "#fafafa" }}>
                <TableCell></TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={thaoTac}
                      onChange={(e) => setThaoTac(e.target.value as string)}
                      displayEmpty>
                      <MenuItem value="Tất cả">Tất cả</MenuItem>
                      <MenuItem value="MUON">MƯỢN BA</MenuItem>
                      <MenuItem value="TRA">TRẢ BA</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Tìm người mượn..."
                    value={nguoiMuon}
                    onChange={(e) => setNguoiMuon(e.target.value)}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Tìm ngày trả..."
                    value={ngayTra}
                    onChange={(e) => setNgayTra(e.target.value)}
                  />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>

              {/* Data Rows */}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <TableRow key={row.cid || index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.cthaotac === "TRA" ? "TRẢ BA" : "MƯỢN BA"}
                        color={row.cthaotac === "TRA" ? "warning" : "success"}
                        size="small"
                        sx={{ fontWeight: "bold", color: "white" }}
                      />
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.cngaythaotac)}</TableCell>
                    <TableCell>{row.cnguoimuon || ""}</TableCell>
                    <TableCell>
                      {formatDisplayDate(row.cngaytradukien)}
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.cngaytra)}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          row.ctrangthaitra === "1" ? "Đã trả" : "Chưa trả"
                        }
                        color={row.ctrangthaitra === "1" ? "success" : "error"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có dữ liệu lịch sử mượn trả
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Typography variant="body2" color="text.secondary">
            Tổng số: {filteredData.length} bản ghi
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={onClose}
            startIcon={<Clear />}
            sx={{ padding: "8px 24px", fontWeight: "bold" }}>
            ĐÓNG
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LsMuonTraHsba;
