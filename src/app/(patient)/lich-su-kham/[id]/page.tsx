"use client";

import {
  CheckCircle,
  ChevronRight,
  Delete,
  Print,
  Search,
} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const patientHistory = [
  { date: "25/01/2021", description: "Khám tổng quát" },
  { date: "26/01/2021", description: "Tái khám huyết áp" },
];

const medicines = [{ name: "Savil Losartan 100", unit: "viên" }];

export default function Page() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(
    patientHistory[patientHistory.length - 1]
  );
  const [gender, setGender] = useState("Nam");

  const handleHistoryClick = (item: any) => {
    setSelectedHistory(item);
  };

  useEffect(() => {
    const token = localStorage.getItem("token-patient");

    if (token) {
      setIsChecking(false);
      return;
    }

    if (!token) {
      return router.push(`/lich-su-kham?mabn=${id}`);
    }
  }, [id, router]);

  if (isChecking) return null;

  return (
    <Box sx={{ display: "flex", height: "100vh", p: 2, bgcolor: "#f5f5f5" }}>
      {/* Sidebar - Lịch sử khám bệnh */}
      <Card sx={{ width: 300, mr: 2, p: 1, overflow: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Lịch sử khám bệnh
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="date"
              size="small"
              defaultValue="2000-01-01"
              label="Từ ngày"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              size="small"
              defaultValue="2025-08-22"
              label="Đến ngày"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <Button variant="contained" startIcon={<Search />} fullWidth>
              Tìm kiếm
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Lịch sử khám:
          </Typography>
          {patientHistory.map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 1,
                cursor: "pointer",
                bgcolor:
                  selectedHistory?.date === item.date
                    ? "#e0e0e0"
                    : "transparent",
                "&:hover": { bgcolor: "#f0f0f0" },
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => handleHistoryClick(item)}>
              <ChevronRight sx={{ fontSize: 16 }} />
              <Typography variant="body2">{item.date}</Typography>
              <Typography
                variant="caption"
                sx={{ ml: 1, color: "text.secondary" }}>
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Main Content - Thông tin khám bệnh và kê đơn */}
      <Card sx={{ flexGrow: 1, p: 2, overflow: "auto" }}>
        <Grid container spacing={2}>
          {/* Thông tin bệnh nhân */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Thông tin khám bệnh
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={2}>
                <TextField
                  label="Mã bệnh nhân"
                  value="1217278"
                  size="small"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Họ tên"
                  value="BÙI VĂN GIÀU"
                  size="small"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={1}>
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
              <Grid item xs={3}>
                <TextField
                  label="Địa chỉ"
                  value="ấp 6, Xã Suối Ngô, Huyện Tân Châu, Tỉnh Tây Ninh"
                  size="small"
                  fullWidth
                  disabled
                />
              </Grid>
              {/* Thêm các trường khác tương tự */}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Dữ liệu khám bệnh */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={2}>
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
              <Grid item xs={2}>
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
              <Grid item xs={2}>
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
              {/* Thêm các trường khác */}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Chẩn đoán */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField label="Chẩn đoán" multiline rows={2} fullWidth />
              <TextField label="Mã ICD" size="small" value="36615" />
              <TextField
                label="110 - Bệnh lý tăng huyết áp"
                multiline
                rows={2}
                fullWidth
                disabled
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Kê đơn thuốc */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h6">Toa thuốc</Typography>
              <Autocomplete
                options={[]}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Dịch vụ kỹ thuật"
                    size="small"
                  />
                )}
                sx={{ width: 200 }}
              />
              <Button variant="outlined">Kê LIS</Button>
              <Button variant="outlined">CD Hình ảnh</Button>
              <Button variant="outlined">Lược trình điều trị</Button>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mã thuốc</TableCell>
                    <TableCell>Tên thuốc</TableCell>
                    <TableCell>ĐVT</TableCell>
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
                  {medicines.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>485612</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>30</TableCell>
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
                justifyContent: "flex-end",
                gap: 1,
              }}>
              <Button variant="outlined" startIcon={<Print />}>
                In toa thuốc
              </Button>
              <Button variant="outlined" startIcon={<Delete />}>
                Xóa
              </Button>
              <Button variant="contained" startIcon={<CheckCircle />}>
                Đóng
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
