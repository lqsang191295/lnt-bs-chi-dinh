"use client";

import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Radio,
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
          <Grid container spacing={1} alignItems="center">
            {/* Dòng 1 */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "nowrap", mr: 2 }}>
                  Mã bệnh nhân
                </Typography>
                <TextField fullWidth size="small" variant="outlined" />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "nowrap", mr: 2 }}>
                  Họ Tên
                </Typography>
                <TextField fullWidth size="small" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Đối tượng</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                value="Người tham gia bảo hiểm theo hộ gia đình"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Họ Tên</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                value="BÙI VĂN GIÀU"
                size="small"
                fullWidth
                disabled
                InputProps={{ sx: { color: "red", fontWeight: 700 } }}
              />
            </Grid>
            <Grid item xs={0.8}>
              <Typography fontWeight={500}>Nam</Typography>
            </Grid>
            <Grid item xs={0.5}>
              <Radio checked value="Nam" size="small" disabled />
            </Grid>
            <Grid item xs={0.8}>
              <Typography fontWeight={500}>Nữ</Typography>
            </Grid>
            <Grid item xs={0.5}>
              <Radio value="Nữ" size="small" disabled />
            </Grid>
            <Grid item xs={0.7}>
              <Typography fontWeight={500}>Tuổi</Typography>
            </Grid>
            <Grid item xs={0.8}>
              <TextField value="54" size="small" fullWidth disabled />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Tỷ lệ miễn giảm</Typography>
            </Grid>
            <Grid item xs={1}>
              <TextField value="80.00 %" size="small" fullWidth disabled />
            </Grid>
            <Grid item xs={1.5}>
              <Typography fontWeight={500}>Khám sức khỏe</Typography>
            </Grid>
            <Grid item xs={0.5}>
              <Radio value="checked" size="small" disabled />
            </Grid>
            {/* Dòng 2 */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Địa chỉ</Typography>
            </Grid>
            <Grid item xs={5.5}>
              <TextField
                value="ấp 6, Xã Suối Ngô, Huyện Tân Châu, Tỉnh Tây Ninh"
                size="small"
                fullWidth
                disabled
                InputProps={{ sx: { color: "red", fontWeight: 700 } }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Mã bệnh án NT</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField value="36615" size="small" fullWidth disabled />
            </Grid>
            {/* Dòng 3 */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Bác sĩ</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField value="Ngô Thị Vân" size="small" fullWidth disabled />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Mạch</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">lần/phút</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Nhiệt độ</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Nhịp thở</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">lần/phút</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Huyết áp</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mmHg</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Chiều cao</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Cân nặng</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Dòng 4: Triệu chứng, ICD, ... */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Triệu chứng LS (C)</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField size="small" fullWidth />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Mã ICD (Y)</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField value="36615" size="small" fullWidth disabled />
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                value="110 - Bệnh lý tăng huyết áp"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Mã ICD phụ</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField value="-1" size="small" fullWidth disabled />
            </Grid>
            {/* Dòng 5: Bệnh án, Giải quyết, ... */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Bệnh án NT</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Giải quyết</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                value="1 - Cấp toa cho về"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Ngày hẹn</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            {/* Dòng 6: Tuân thủ điều trị, Hồ sơ bệnh án, ... */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Tuân thủ điều trị</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                value="Chưa chọn tuân thủ điều trị"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500} color="red">
                Hồ sơ bệnh án
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500} color="red">
                Người thân lãnh thuốc *
              </Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            {/* Dòng 7: Giai đoạn lâm sàng, ... */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Giai đoạn lâm sàng</Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                value="Không đánh giá"
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Sàng lọc lao</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Vàng da/mắt</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
            {/* Dòng 8: Dấu hiệu thần kinh ngoại biên, ... */}
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>
                Dấu hiệu thần kinh ngoại biên
              </Typography>
            </Grid>
            <Grid item xs={2.5}>
              <TextField size="small" fullWidth />
            </Grid>
            <Grid item xs={1.2}>
              <Typography fontWeight={500}>Mang thai/cho con bú</Typography>
            </Grid>
            <Grid item xs={1.5}>
              <TextField size="small" fullWidth />
            </Grid>
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
