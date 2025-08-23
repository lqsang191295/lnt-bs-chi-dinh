"use client";

import {
  Box,
  Button,
  Card,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const patientHistory = [
  { date: "25/01/2021", description: "Khám tổng quát" },
  { date: "26/01/2021", description: "Tái khám huyết áp" },
];

const medicines = [{ name: "Savil Losartan 100", unit: "viên", quantity: 30 }];

export default function Page() {
  const [selectedHistory, setSelectedHistory] = useState(patientHistory[0]);
  const [tab, setTab] = useState(0);
  const [gender, setGender] = useState("Nam");

  return (
    <Box className="flex gap-2 h-full">
      {/* Sidebar - Lịch sử khám bệnh */}
      <Paper
        elevation={3}
        sx={{
          width: 320,
          p: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
        }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử khám bệnh
        </Typography>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              type="date"
              label="Từ ngày"
              size="small"
              InputLabelProps={{ shrink: true }}
              fullWidth
              defaultValue="2000-01-01"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              type="date"
              label="Đến ngày"
              size="small"
              InputLabelProps={{ shrink: true }}
              fullWidth
              defaultValue="2025-08-22"
            />
          </Grid>
        </Grid>
        <Button variant="contained" fullWidth sx={{ mb: 2 }} size="small">
          Tìm kiếm
        </Button>
        <Divider sx={{ mb: 1 }} />
        <Typography
          variant="subtitle2"
          sx={{ mb: 1 }}
          className="bg-blue-100 p-1 !font-bold text-center">
          Lịch sử khám
        </Typography>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {patientHistory.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1,
                mb: 1,
                borderRadius: 1,
                bgcolor:
                  selectedHistory.date === item.date
                    ? "#e3f2fd"
                    : "transparent",
                cursor: "pointer",
                border:
                  selectedHistory.date === item.date
                    ? "1px solid #1976d2"
                    : "1px solid transparent",
              }}
              onClick={() => setSelectedHistory(item)}>
              <Typography variant="body2" fontWeight={600}>
                {item.date}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 1, overflow: "auto" }}>
        {/* Thông tin bệnh nhân */}
        <Card sx={{ mb: 2, p: 2 }}>
          <Grid container spacing={1}>
            <Grid className="flex" size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography>Mã bệnh nhân</Typography>
              <TextField
                label="Mã bệnh nhân"
                value="1217278"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                label="Họ tên"
                value="BÙI VĂN GIÀU"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <RadioGroup
                row
                value={gender}
                onChange={(e) => setGender(e.target.value)}>
                <FormControlLabel
                  value="Nam"
                  control={<Radio size="small" />}
                  label="Nam"
                />
                <FormControlLabel
                  value="Nữ"
                  control={<Radio size="small" />}
                  label="Nữ"
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={1}>
              <TextField
                label="Tuổi"
                value="54"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Tỷ lệ miễn giảm"
                value="80.00 %"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={3.1}>
              <TextField
                label="Địa chỉ"
                value="ấp 6, Xã Suối Ngô, Huyện Tân Châu, Tỉnh Tây Ninh"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2.2}>
              <TextField
                label="Đối tượng"
                value="Người tham gia bảo hiểm theo hộ gia đình"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2.2}>
              <TextField
                label="Ngày khám"
                value={selectedHistory.date}
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2.2}>
              <TextField
                label="Bác sĩ"
                value="Ngô Thị Vân"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Mạch"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">lần/phút</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Nhiệt độ"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Nhịp thở"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">lần/phút</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Huyết áp"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mmHg</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Chiều cao"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                label="Cân nặng"
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={2.2}>
              <TextField
                label="Mã bệnh án NT"
                value="36615"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            {/* Thêm các trường khác nếu cần */}
          </Grid>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
            <Tab label="Toa thuốc" />
            <Tab label="Dịch vụ kỹ thuật" />
            <Tab label="Kết quả CLS" />
            <Tab label="Chi phí" />
            {/* Thêm các tab khác nếu cần */}
          </Tabs>
          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <>
                {/* Toa thuốc */}
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã thuốc</TableCell>
                        <TableCell>Tên thuốc</TableCell>
                        <TableCell>ĐVT</TableCell>
                        <TableCell>Số ngày</TableCell>
                        <TableCell>Sáng</TableCell>
                        <TableCell>Trưa</TableCell>
                        <TableCell>Chiều</TableCell>
                        <TableCell>Tối</TableCell>
                        <TableCell>Số lượng</TableCell>
                        <TableCell>Ghi chú</TableCell>
                        <TableCell>Nguồn thuốc</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {medicines.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>485612</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>30</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell></TableCell>
                          <TableCell>BHYT</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}>
                  <Button variant="contained">In toa thuốc</Button>
                  <Button variant="outlined" color="error">
                    Xóa
                  </Button>
                  <Button variant="contained" color="success">
                    Đóng
                  </Button>
                </Box>
              </>
            )}
            {tab === 1 && (
              <Typography>
                Chỉ định dịch vụ kỹ thuật (đang phát triển)
              </Typography>
            )}
            {tab === 2 && (
              <Typography>Kết quả cận lâm sàng (đang phát triển)</Typography>
            )}
            {tab === 3 && <Typography>Chi phí (đang phát triển)</Typography>}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
