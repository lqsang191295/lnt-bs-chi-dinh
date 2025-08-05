"use client";

import React, { useEffect, useState } from "react";
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
import { IUserItem } from "@/model/user"; 
import { gettDMKhoaPhongs } from "@/actions/emr_tdmkhoaphong";
import { instnguoidung, gettnguoidung, gettnhomnguoidung } from "@/actions/emr_tnguoidung";
import { get } from "http";
import { useUserStore } from "@/store/user";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const { data: loginedUser } = useUserStore();
  const [nhomNguoiDungList, setNhomNguoiDungList] = useState<{ value: string; label: string }[]>([]);
  const [selectedNhomNguoiDung, setSelectedNhomNguoiDung] = useState("");
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [page, setPage] = useState(0);
  const [newUserStatus, setNewUserStatus] = useState(0);
  useEffect(() => {
    if (!loginedUser || !loginedUser.ctaikhoan) {
      router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
      return;
    }
    async function fetchUsers() {
      const result = await gettnguoidung(loginedUser.ctaikhoan, "1");
      if (Array.isArray(result)) {
        setUsers(result as IUserItem[]);
        setSelectedUser(result[0] as IUserItem);
      }
    }
    fetchUsers();
    async function fetchNhomNguoiDungList() {
      try {
        const result = await gettnhomnguoidung(loginedUser.ctaikhoan, "1");
        if (Array.isArray(result)) {
          const mapped = result.map((item: any) => ({
            value: item.cid,
            label: item.ctennhom,
          }));
          setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }, ...mapped]);
        } else {
          setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }]);
        }
      } catch (error) {
        setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }]);
      }
    }
    fetchNhomNguoiDungList();

    async function fetchKhoaList() {
      try {
        const result = await gettDMKhoaPhongs();
        if (Array.isArray(result)) {
          const mapped = result.map((item: any) => ({
            value: item.cid,
            label: item.ckyhieu + " - " + item.ctenkhoa,
          }));
          setKhoaList([{ value: "", label: "Chọn Khoa phòng" }, ...mapped]);
        } else {
          setKhoaList([{ value: "", label: "Chọn Khoa phòng" }]);
        }
      } catch (error) {
        setKhoaList([{ value: "", label: "Chọn Khoa phòng" }]);
      }
    }
    fetchKhoaList();
  }, [loginedUser]);
  const handleRowClick = (user: any) => {
    setSelectedUser(user);
     console.log("manhomnguoidung", user.cmanhomnguoidung);
  };
  const handleChange = (field: string, value: any) => {
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as IUserItem;
    });
  };
  const onchangeKhoa = (o: any) => {
    handleChange("cmadonvi", o);
    setSelectedKhoa(o);
  };

  const onchangeNhom = (o: any) => {
    handleChange("cmanhomnguoidung", o);
    setSelectedNhomNguoiDung(o);
  };
 
  const handleThem = async () => {
    setNewUserStatus(1);
    setSelectedUser({
      cid: 0,
      ctaikhoan: "",
      cmatkhau: "",
      choten: "",
      cngaysinh: "",
      cdienthoai: "",
      cdiachi: "",
      ccchn: "",
      cemail: "",
      cchucdanh: "",
      cghichu: "",
      cxacthuc2lop: "",
      cmadonvi: selectedKhoa,
      cmanhomnguoidung: selectedNhomNguoiDung,
      ctrangthai: "1",
      cngaytao: "",
      cnguoitao: loginedUser.ctaikhoan,
    } as IUserItem);
  
  };
  const handleLuu = async () => {
    if (newUserStatus === 1) {
      if (!selectedUser || !selectedUser.ctaikhoan || !selectedUser.cmatkhau) {
        alert("Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu");
        return;
      }
      const result = await instnguoidung(loginedUser.ctaikhoan, "1", selectedUser);
      if (result) {
        alert("Thêm người dùng thành công");
        setUsers((prev) => [...prev, selectedUser]);
        setSelectedUser(null);
        setNewUserStatus(0);
      } else {
        alert("Thêm người dùng thất bại");
      }
      return; 
    }
    else if (newUserStatus === 0) { 
      if (!selectedUser) return;
      console.log("selectedUser", selectedUser);
      const result = await instnguoidung(loginedUser.ctaikhoan, "2", selectedUser);
      console.log("result", result);
      if (result) {
        alert("Cập nhật người dùng thành công");
        setUsers((prev) => prev.map((user) => (user.cid === selectedUser.cid ? selectedUser : user)));
      } else {
        alert("Cập nhật người dùng thất bại");
      }
    }
  };

  const handleHuy = () => {
    setSelectedUser(null);
    setNewUserStatus(0);
  };
  const handleXoa = async () => {
    if (!selectedUser) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      const result = await instnguoidung(loginedUser.ctaikhoan, "3", selectedUser);
      if (result) {
        alert("Xóa người dùng thành công");
        setUsers((prev) => prev.filter((user) => user.cid !== selectedUser.cid));
        setSelectedUser(null);
      } else {
        alert("Xóa người dùng thất bại");
      }
    }
  };
  const handleDoiMatKhau = async () => {
    if (!selectedUser) return;
    const result = await instnguoidung(loginedUser.ctaikhoan, "4", selectedUser);
    if (result) {
      alert("Đổi mật khẩu người dùng thành công");
      setUsers((prev) => prev.filter((user) => user.cid !== selectedUser.cid));
      setSelectedUser(null);
    } else {
      alert("Đổi mật khẩu người dùng thất bại");
    }
  }
  const handlePhanQuyen = () => {
    if (!selectedUser) return;
    router.push(`/phan-quyen/${selectedUser.cid}`);
  };
  const taikhoans:  { field: keyof IUserItem; label: string; type?: string }[] = [
              { label: "Tài khoản", field: "ctaikhoan" },
              { label: "Họ Tên", field: "choten" },
              { label: "Ngày sinh", field: "cngaysinh", type: "date" },
              { label: "Số điện thoại", field: "cdienthoai" },
              { label: "Địa chỉ", field: "cdiachi" },
              { label: "CCHN", field: "ccchn" },
              { label: "Email", field: "cemail" },
              { label: "Chức danh", field: "cchucdanh" },
              { label: "Ghi chú", field: "cghichu" },
              { label: "Xác thực 2 lớp", field: "cxacthuc2lop", type: "checkbox"   }, 
            ];
  return (
    <Grid container spacing={1} p={1} className="h-full overflow-hidden">
      {/* Bảng danh sách */}
      <Grid
        size={8}
        className="h-full flex flex-col overflow-hidden bg-white p-4">
        <Typography variant="h6" mb={1} sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
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
              {users.map((user, idx) => (
                <StyledTableRow
                  key={user.cid}
                  hover
                  selected={selectedUser?.cid === user.cid}
                  onClick={() => handleRowClick(user)}
                  sx={{ cursor: "pointer" }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{user.ctaikhoan}</TableCell>
                  <TableCell component="th" scope="row">
                    {user.choten}
                  </TableCell>
                  <TableCell>{user.cngaysinh}</TableCell>
                  <TableCell>{user.cdienthoai}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={users.length}
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
        <Typography variant="h6" mb={1} sx={{ color: "#1976d2", letterSpacing: 1 }}>
          THÔNG TIN NGƯỜI DÙNG
        </Typography> <form  >
        <Box className="h-full flex flex-col overflow-hidden py-2">
          <Grid container spacing={2}>
            {taikhoans.map(({ label, field, type }) => (
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
            <Grid size={12} >
                <TextField
                  fullWidth
                  //autoComplete="current-password"
                  size="small"
                  label="Mật khẩu *"
                  value=""
                  type= "password"
                  placeholder="********"
                  onChange={(e) => handleChange("cmatkhau", e.target.value)}
                  // disabled={newUserStatus === 0} // Disable when adding new user
                />
            </Grid>
            <Grid size={12}>
             <Select
                fullWidth
                size="small"
                value={
                  khoaList.some((item) => item.value === selectedUser?.cmadonvi)
                    ? selectedUser?.cmadonvi
                    : ""
                }
                onChange={(e) => handleChange("cmadonvi", e.target.value)}
                displayEmpty
              >
                {khoaList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={12}>              
              <Select
                fullWidth
                size="small"
                value={
                  nhomNguoiDungList.some((item) => item.value === selectedUser?.cmanhomnguoidung)
                    ? selectedUser?.cmanhomnguoidung
                    : ""
                }
                onChange={(e) => handleChange("cmanhomnguoidung", e.target.value)}
                displayEmpty
              >
                {nhomNguoiDungList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={12}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button variant="contained" onClick={() => handleThem() }>THÊM</Button>
                <Button variant="contained" color="primary" onClick={() => handleLuu() }>LƯU</Button>
                <Button variant="contained" color="primary" onClick={() => handleDoiMatKhau() }>ĐỔI MẬT KHẨU</Button>
                <Button variant="outlined" onClick={() => handleHuy() }>HUỶ</Button>
                <Button variant="outlined" color="error" onClick={() => handleXoa() }>XOÁ</Button>
                <Button variant="outlined" onClick={() => handlePhanQuyen() }>PHÂN QUYỀN</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
      </Grid>
    </Grid>
  );
}
