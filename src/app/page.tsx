"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export default function HSBAMoPage() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        HỒ SƠ BỆNH ÁN MỞ
      </Typography>

      {/* Bộ lọc */}
      <Stack
        direction="row"
        spacing={2}
        mb={2}
        flexWrap="wrap"
        alignItems="center">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Khoa</InputLabel>
          <Select defaultValue="">
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="hoiSuc">Khoa Hồi sức cấp cứu</MenuItem>
          </Select>
        </FormControl>

        <RadioGroup row defaultValue="vaoVien">
          <FormControlLabel
            value="vaoVien"
            control={<Radio />}
            label="Ngày vào viện"
          />
          <FormControlLabel
            value="raVien"
            control={<Radio />}
            label="Ngày ra viện"
          />
        </RadioGroup>

        <DatePicker
          label="Từ ngày"
          value={fromDate}
          onChange={setFromDate}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          label="Đến ngày"
          value={toDate}
          onChange={setToDate}
          slotProps={{ textField: { size: "small" } }}
        />

        <Button variant="contained" startIcon={<SearchIcon />}>
          Tìm kiếm
        </Button>
      </Stack>

      {/* Bảng danh sách */}
      <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              {[
                "Trạng thái",
                "Họ và tên",
                "Mã BA",
                "Ngày sinh",
                "Giới tính",
                "Tuổi",
                "Ngày vào viện",
                "Ngày ra viện",
                "Chẩn đoán",
                "Khoa",
                "Loại hình điều trị",
                "Đối tượng",
                "Hình thức xử trí",
                "Phiếu",
              ].map((col) => (
                <TableCell key={col} sx={{ border: "1px solid #ccc" }}>
                  {col}
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Row mẫu */}
            <TableRow hover selected>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                <Button size="small" variant="contained" color="success">
                  Mở
                </Button>
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                HUỲNH LONG PHÚ
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                BA25001478
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                01/01/1965
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Nam</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>60 Tuổi</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                28/07/2025
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>...</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                Khoa Hồi sức cấp cứu
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                Điều trị nội trú
              </TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>BHYT</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>...</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>
                <Box display="flex" gap={0.5}>
                  <Button variant="contained" color="success" size="small">
                    17
                  </Button>
                  /
                  <Button variant="outlined" size="small">
                    17
                  </Button>
                </Box>
              </TableCell>
              <TableCell>
                <IconButton>
                  <DragIndicatorIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
