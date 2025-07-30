"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

const mockUsers = [
  {
    id: 1,
    username: "0337293205",
    name: "Huỳnh Trung Đông",
    dob: "2000-01-01",
    phone: "0337293205",
  },
  {
    id: 2,
    username: "090690770",
    name: "Nguyễn Thị Phương Thúy",
    dob: "1982-10-11",
    phone: "090690770",
  },
  {
    id: 3,
    username: "0945195957",
    name: "Lê Bích Ngọc",
    dob: "1994-10-11",
    phone: "0945195957",
  },
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.common.black,
    // color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [page, setPage] = useState(0);

  const handleRowClick = (user: any) => setSelectedUser(user);
  const handleChange = (field: string, value: any) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Grid container spacing={1} p={1} className="h-full overflow-hidden">
      {/* Bảng danh sách */}
      <Grid
        size={8}
        className="h-full flex flex-col overflow-hidden bg-white p-4">
        <Typography variant="h6" mb={1}>
          DANH SÁCH NGƯỜI DÙNG
        </Typography>
        <TableContainer
          component={Paper}
          className="h-full overflow-hidden relative flex-1 box-shadow"
          sx={{ boxShadow: "none" }}>
          <Table
            size="small"
            aria-label="customized table"
            sx={{
              // border: "1px solid #ccc",
              "& td, & th": {
                border: "1px solid #ccc",
              },
            }}>
            <TableHead>
              <TableRow className="bg-blue-200">
                <TableCell>STT</TableCell>
                <TableCell>Tài khoản</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Ngày sinh</TableCell>
                <TableCell>SĐT</TableCell>
              </TableRow>
              {/* <TableRow className="bg-gray-200">
                {[...Array(5)].map((_, idx) => (
                  <TableCell key={idx}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`Search`}
                      type={"text"}
                    />
                  </TableCell>
                ))}
              </TableRow> */}
            </TableHead>
            <TableBody>
              {mockUsers.map((user, idx) => (
                <StyledTableRow
                  key={user.id}
                  hover
                  selected={selectedUser?.id === user.id}
                  onClick={() => handleRowClick(user)}
                  sx={{ cursor: "pointer" }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell component="th" scope="row">
                    {user.name}
                  </TableCell>
                  <TableCell>{user.dob}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={mockUsers.length}
            rowsPerPage={5}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPageOptions={[]}
            className="absolute bottom-0 right-0"
          />
        </TableContainer>
      </Grid>

      {/* Form chi tiết */}
      <Grid
        size={4}
        className="h-full flex flex-col overflow-hidden bg-white p-4">
        <Typography variant="h6" mb={1}>
          THÔNG TIN NGƯỜI DÙNG
        </Typography>
        <Box className="h-full flex flex-col overflow-hidden py-2">
          <Grid container spacing={2}>
            {[
              { label: "Tài khoản", field: "username" },
              { label: "Họ Tên", field: "name" },
              { label: "Ngày sinh", field: "dob", type: "date" },
              { label: "Số điện thoại", field: "phone" },
            ].map(({ label, field, type }) => (
              <Grid size={12} key={field}>
                <TextField
                  fullWidth
                  size="small"
                  label={`${label} *`}
                  value={selectedUser?.[field] || ""}
                  type={type || "text"}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </Grid>
            ))}

            <Grid size={12}>
              <Select
                fullWidth
                size="small"
                value={selectedUser?.group || ""}
                onChange={(e) => handleChange("group", e.target.value)}
                // input={<OutlinedInput label="Chọn nhóm người dùng" />}
                displayEmpty>
                <MenuItem value="">Chọn nhóm người dùng</MenuItem>
                <MenuItem value="root">root</MenuItem>
                <MenuItem value="admin">Admin đơn vị</MenuItem>
                <MenuItem value="doctor">Bác sĩ</MenuItem>
                <MenuItem value="head">Trưởng khoa</MenuItem>
              </Select>
            </Grid>

            <Grid size={12}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button variant="contained">THÊM</Button>
                <Button variant="contained" color="primary">
                  LƯU
                </Button>
                <Button variant="outlined">HUỶ</Button>
                <Button variant="outlined" color="error">
                  XOÁ
                </Button>
                <Button variant="outlined">PHÂN QUYỀN</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
