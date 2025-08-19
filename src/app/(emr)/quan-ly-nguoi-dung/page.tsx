// src/app/quan-ly-nguoi-dung/page.tsx
"use client";

import {
  gettnguoidung,
  gettnhomnguoidung,
  instnguoidung,
} from "@/actions/act_tnguoidung";
import { ITnhomNguoiDung } from "@/model/tnhomnguoidung";
import { ISelectOption } from "@/model/ui";
import { IUserItem } from "@/model/tuser";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useCallback, useEffect, useState } from "react";
import DialogPhanQuyen from "./components/dialog-phan-quyen";
import HeadMetadata from "./head-metadata";

const columns: GridColDef[] = [
  {
    field: "stt",
    headerName: "STT",
    flex: 0.5,
  },
  { field: "ctaikhoan", headerName: "Tài khoản", flex: 1 },
  { field: "choten", headerName: "Họ tên", flex: 1.5 },
  { field: "cngaysinh", headerName: "Ngày sinh", flex: 1 },
  { field: "cdienthoai", headerName: "SĐT", flex: 1 },
];

const taikhoans: { field: keyof IUserItem; label: string; type?: string }[] = [
  { label: "Họ Tên", field: "choten" },
  { label: "Ngày sinh", field: "cngaysinh", type: "date" },
  { label: "Số điện thoại", field: "cdienthoai" },
  { label: "Địa chỉ", field: "cdiachi" },
  { label: "CCHN", field: "ccchn" },
  { label: "Email", field: "cemail" },
  { label: "Chức danh", field: "cchucdanh" },
  { label: "Ghi chú", field: "cghichu" },
  { label: "Tài khoản đăng nhập", field: "ctaikhoan" },
  // { label: "Xác thực 2 lớp", field: "cxacthuc2lop", type: "checkbox"   },
];

function TabPanel(props: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function PageQuanLyNguoiDung() {
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const { data: loginedUser } = useUserStore();
  const [nhomNguoiDungList, setNhomNguoiDungList] = useState<ISelectOption[]>(
    []
  );
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [page, setPage] = useState(0);
  const [newUserStatus, setNewUserStatus] = useState(0);
  const [password, setPassword] = useState("");
  const [openPhanQuyen, setOpenPhanQuyen] = useState(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

  const handlePhanQuyen = () => {
    if (!selectedUser) return;
    setOpenPhanQuyen(true);
  };

  const handleClosePhanQuyen = () => {
    setOpenPhanQuyen(false);
  };

  const fetchUsers = useCallback(async () => {
    if (!loginedUser || !loginedUser.ctaikhoan) return;
    setLoadingUser(true);
    try {
      const result = await gettnguoidung(loginedUser.ctaikhoan, "1");
      if (Array.isArray(result)) {
        setUsers(
          result.map((row) => ({
            ...row,
            id: row.cid,
          }))
        );
        setSelectedUser(result[0] as IUserItem);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUser(false);
    }
  }, [loginedUser]);

  const fetchNhomNguoiDungList = useCallback(async () => {
    try {
      const result = await gettnhomnguoidung(loginedUser.ctaikhoan, "1");

      console.log("------------------ Nhom nguoi dung result:", result);

      if (Array.isArray(result)) {
        const mapped = result.map((item: ITnhomNguoiDung) => ({
          value: item.cid,
          label: item.ctennhom,
        }));
        setNhomNguoiDungList([
          { value: "", label: "Chọn nhóm người dùng" },
          ...mapped,
        ]);
      } else {
        setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }]);
      }
    } catch {
      setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }]);
    }
  }, [loginedUser]);

  const fetchKhoaList = useCallback(async () => {
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchNhomNguoiDungList();
    fetchKhoaList();
  }, [fetchUsers, fetchNhomNguoiDungList, fetchKhoaList]);

  const handleRowClick = (user: IUserItem) => {
    setSelectedUser(user);
  };

  const handleChange = (field: string, value: string) => {
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as IUserItem;
    });
  };

  const handleThem = async () => {
    setNewUserStatus(1);
    setSelectedUser({
      cid: "0",
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
      cmadonvi: "",
      cmanhomnguoidung: "",
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
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "1",
        selectedUser
      );

      const arr = result as Array<{ _ID: number }>;

      if (
        typeof arr === "string" &&
        arr === "Authorization has been denied for this request."
      ) {
        alert("Bạn không có quyền thêm người dùng!");
      } else if (
        Array.isArray(arr) &&
        arr.length > 0 &&
        typeof arr[0]._ID !== "undefined"
      ) {
        alert("Thêm người dùng thành công");
        setUsers((prev) => [...prev, selectedUser]);
        setSelectedUser(null);
        setNewUserStatus(0);
      } else {
        alert("Thêm người dùng thất bại");
      }
    } else if (newUserStatus === 0) {
      if (!selectedUser) return;
      //console.log("selectedUser", selectedUser);
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "2",
        selectedUser
      );
      //console.log("result", result);
      const arr = result as Array<{ ROW_COUNT: number }>;

      if (
        typeof arr === "string" &&
        arr === "Authorization has been denied for this request."
      ) {
        alert("Bạn không có quyền cập nhật thông tin người dùng!");
      } else if (
        Array.isArray(arr) &&
        arr.length > 0 &&
        typeof arr[0].ROW_COUNT !== "undefined"
      ) {
        alert("Cập nhật người dùng thành công");
        setUsers((prev) =>
          prev.map((user) =>
            user.cid === selectedUser.cid ? selectedUser : user
          )
        );
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
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "3",
        selectedUser
      );
      if (result) {
        alert("Xóa người dùng thành công");
        setUsers((prev) =>
          prev.filter((user) => user.cid !== selectedUser.cid)
        );
        setSelectedUser(null);
      } else {
        alert("Xóa người dùng thất bại");
      }
    }
  };
  const handleDoiMatKhau = async () => {
    if (!selectedUser) return;
    const result = await instnguoidung(
      loginedUser.ctaikhoan,
      "4",
      selectedUser
    );
    if (result) {
      alert("Đổi mật khẩu người dùng thành công");
      setUsers((prev) => prev.filter((user) => user.cid !== selectedUser.cid));
      setSelectedUser(null);
    } else {
      alert("Đổi mật khẩu người dùng thất bại");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata />
      <Grid container spacing={1} p={1} className="h-full overflow-hidden">
        {/* Bảng danh sách */}
        <Grid
          size={8}
          className="h-full flex flex-col overflow-hidden bg-white p-4">
          <Typography
            variant="h6"
            mb={1}
            sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}>
            DANH SÁCH NGƯỜI DÙNG
          </Typography>

          <Box className="w-full h-full overflow-hidden relative flex-1 box-shadow flex flex-col">
            <DataGrid
              rows={users}
              columns={columns}
              pagination
              density="compact"
              onRowClick={(params) => handleRowClick(params.row as IUserItem)}
              loading={loadingUser}
            />
          </Box>
          {/* <TableContainer
            component={Paper}
            className="h-full overflow-hidden relative flex-1 box-shadow flex flex-col"
            sx={{ boxShadow: "none" }}>
            <Table
              size="small"
              aria-label="customized table"
              sx={{
                "& td, & th": {
                  border: "1px solid #ccc",
                },
              }}
              className="h-full">
              <TableHead>
                <TableRow className="bg-blue-200">
                  <TableCell>STT</TableCell>
                  <TableCell>Tài khoản</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>SĐT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow
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
                  </TableRow>
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
              className="overflow-hidden"
            />
          </TableContainer> */}
        </Grid>

        {/* Form chi tiết */}

        <Grid
          size={4}
          className="h-full flex flex-col overflow-hidden bg-white">
          <Typography
            variant="h6"
            mb={1}
            sx={{ color: "#1976d2", letterSpacing: 1 }}
            className="px-4 pt-4">
            THÔNG TIN NGƯỜI DÙNG
          </Typography>
          <form className="h-full flex flex-col flex-1 overflow-hidden">
            <Box className="flex flex-col overflow-hidden">
              <Grid
                container
                spacing={2}
                className="flex-1 overflow-y-auto px-4">
                <Grid size={12}>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: "small",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                      color: "#4d5052ff",
                      letterSpacing: 1,
                    }}>
                    Khoa phòng
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedUser?.cmadonvi || ""}
                    onChange={(e) => handleChange("cmadonvi", e.target.value)}
                    displayEmpty>
                    {khoaList.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={12}>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: "small",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                      color: "#4d5052ff",
                      letterSpacing: 1,
                    }}>
                    Nhóm người dùng
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedUser?.cmanhomnguoidung || ""}
                    onChange={(e) =>
                      handleChange("cmanhomnguoidung", e.target.value)
                    }
                    displayEmpty>
                    {nhomNguoiDungList.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
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
                <Grid size={12}>
                  <Box display="flex" alignItems="center" minHeight={40}>
                    <input
                      type="checkbox"
                      checked={selectedUser?.cxacthuc2lop === "1"}
                      onChange={(e) =>
                        handleChange(
                          "cxacthuc2lop",
                          e.target.checked ? "1" : "0"
                        )
                      }
                      style={{ marginRight: 8 }}
                    />
                    <Typography
                      component="label"
                      sx={{
                        whiteSpace: "normal",
                        lineHeight: 1.2,
                        color: "#191a1bff",
                        letterSpacing: 1,
                      }}>
                      Xác thực 2 lớp *
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mật khẩu *"
                    value={newUserStatus === 1 ? password : ""}
                    type="password"
                    placeholder="********"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      handleChange("cmatkhau", e.target.value);
                    }}
                    disabled={false}
                  />
                </Grid>
              </Grid>

              <Grid size={12} className="px-4 py-2">
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button variant="contained" onClick={() => handleThem()}>
                    THÊM
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleLuu()}>
                    LƯU
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDoiMatKhau()}>
                    ĐỔI MẬT KHẨU
                  </Button>
                  <Button variant="outlined" onClick={() => handleHuy()}>
                    HUỶ
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleXoa()}>
                    XOÁ
                  </Button>
                  <Button variant="outlined" onClick={() => handlePhanQuyen()}>
                    PHÂN QUYỀN
                  </Button>
                </Box>
              </Grid>
            </Box>
          </form>
        </Grid>
        {openPhanQuyen && (
          <DialogPhanQuyen
            open={openPhanQuyen}
            onClose={handleClosePhanQuyen}
            selectedUser={selectedUser}
          />
        )}
      </Grid>
    </LocalizationProvider>
  );
}
