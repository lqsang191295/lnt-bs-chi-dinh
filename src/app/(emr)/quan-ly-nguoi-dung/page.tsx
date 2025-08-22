// src/app/quan-ly-nguoi-dung/page.tsx
"use client";

import {
  gettnguoidung,
  gettnhomnguoidung,
  instnguoidung,
} from "@/actions/act_tnguoidung";
import { ITnhomNguoiDung } from "@/model/tnhomnguoidung";
import { IUserItem } from "@/model/tuser";
import { ISelectOption } from "@/model/ui";
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
import PasswordIcon from "@mui/icons-material/Password";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useCallback, useEffect, useState } from "react";
import DialogPhanQuyen from "./components/dialog-phan-quyen";
import DialogDoiMatKhau from "./components/dialog-doi-mat-khau";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import HeadMetadata from "@/components/HeadMetadata";

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

export default function PageQuanLyNguoiDung() {
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const { data: loginedUser } = useUserStore();
  const [nhomNguoiDungList, setNhomNguoiDungList] = useState<ISelectOption[]>(
    []
  );
  const [password, setPassword] = useState("");
  const [khoaList, setKhoaList] = useState<ISelectOption[]>([]);
  const [newUserStatus, setNewUserStatus] = useState(0);
  const [openPhanQuyen, setOpenPhanQuyen] = useState(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] =
    useState(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

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
      // console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUser(false);
    }
  }, [loginedUser]);

  const fetchNhomNguoiDungList = useCallback(async () => {
    try {
      const result = await gettnhomnguoidung(loginedUser.ctaikhoan, "1");

      // console.log("-------- Nhom nguoi dung result:", result);

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
      // console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchNhomNguoiDungList();
    fetchKhoaList();
  }, [fetchUsers, fetchNhomNguoiDungList, fetchKhoaList]);

  // xử lý chọn người dùng từ ds người dùng
  const handleRowClick = (user: IUserItem) => {
    setSelectedUser(user);
    setNewUserStatus(0); // Reset về chế độ sửa
    setPassword(""); // Reset password khi chọn user khác
  };
  // xử lý khi giá trị 1 trường thay đổi
  const handleChange = (field: string, value: string) => {
    // console.log("handleChange", field, value);
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as IUserItem;
    });
  };
  // xử lý thêm mới người dùng set trạng thái mới các trường về mac định
  const handleThem = async () => {
    setNewUserStatus(1);
    setPassword("");
    setSelectedUser({
      cid: "0",
      ctaikhoan: "",
      cmatkhau: "",
      choten: "",
      cngaysinh: new Date().toISOString().split("T")[0], // Ngày sinh mặc định là hôm nay
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
  // xử lý lưu thông tin người dùng
  const handleLuu = async () => {
    if (newUserStatus === 1) {
      if (!selectedUser || !selectedUser.ctaikhoan || !selectedUser.cmatkhau) {
        ToastWarning("Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu");
        return;
      }

      if (!password || password.length < 6) {
        ToastWarning("Vui lòng nhập mật khẩu có ít nhất 6 ký tự");
        return;
      }

      // Đảm bảo password được set vào selectedUser
      const userToSave = { ...selectedUser, cmatkhau: password };

      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "1",
        userToSave
      );

      const arr = result as Array<{ _ID: number }>;

      if (
        typeof arr === "string" &&
        arr === "Authorization has been denied for this request."
      ) {
        ToastError("Bạn không có quyền thêm người dùng!");
      } else if (
        Array.isArray(arr) &&
        arr.length > 0 &&
        typeof arr[0]._ID !== "undefined"
      ) {
        ToastSuccess("Thêm người dùng thành công");
        setUsers((prev) => [
          ...prev,
          { ...userToSave, cid: arr[0]._ID.toString() },
        ]);
        setSelectedUser(null);
        setNewUserStatus(0);
        setPassword(""); // Reset password sau khi lưu thành công
      } else {
        ToastError("Thêm người dùng thất bại");
      }
    } else if (newUserStatus === 0) {
      if (!selectedUser) return;
      // console.log("user cập nhật:", selectedUser);
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "2",
        selectedUser
      );
      // console.log("kq cập nhật", result);
      const arr = result as Array<{ ROW_COUNT: number }>;

      if (
        typeof arr === "string" &&
        arr === "Authorization has been denied for this request."
      ) {
        ToastError("Bạn không có quyền cập nhật thông tin người dùng!");
      } else if (
        Array.isArray(arr) &&
        arr.length > 0 &&
        typeof arr[0].ROW_COUNT !== "undefined"
      ) {
        ToastSuccess("Cập nhật người dùng thành công");
        setUsers((prev) =>
          prev.map((user) =>
            user.cid === selectedUser.cid ? selectedUser : user
          )
        );
      } else {
        ToastError("Cập nhật người dùng thất bại");
      }
    }
  };
  // xử lý hủy thao tác
  const handleHuy = () => {
    setSelectedUser(null);
    setNewUserStatus(0);
    setPassword(""); // Reset password khi hủy
  };
  // xử lý xóa người dùng
  const handleXoa = async () => {
    if (!selectedUser) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "3",
        selectedUser
      );
      if (result) {
        ToastSuccess("Xóa người dùng thành công");
        setUsers((prev) =>
          prev.filter((user) => user.cid !== selectedUser.cid)
        );
        setSelectedUser(null);
      } else {
        ToastError("Xóa người dùng thất bại");
      }
    }
  };
  // xử lý đổi mật khẩu người dùng
  const handleDoiMatKhau = async () => {
    if (!selectedUser) {
      ToastWarning("Vui lòng chọn người dùng cần đổi mật khẩu!");
      return;
    }
    setOpenChangePasswordDialog(true);
  };

  // Callback xử lý khi đổi mật khẩu thành công
  const handlePasswordChangeSuccess = (updatedUser: IUserItem) => {
    // Cập nhật selectedUser
    setSelectedUser(updatedUser);

    // Cập nhật danh sách users
    setUsers((prev) =>
      prev.map((user) => (user.cid === updatedUser.cid ? updatedUser : user))
    );
  };

  // xử lý phân quyền người dùng mở dialog phân quyền
  const handlePhanQuyen = () => {
    if (!selectedUser) return;
    setOpenPhanQuyen(true);
  };
  // xử lý đóng dialog phân quyền
  const handleClosePhanQuyen = () => {
    setOpenPhanQuyen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Danh sách người dùng" />
      <Grid container spacing={1} p={1} className="h-full overflow-hidden">
        {/* Bảng danh sách */}
        <Grid
          size={8}
          className="h-full flex flex-col overflow-hidden bg-white p-4"
        >
          <Typography
            variant="h6"
            mb={1}
            sx={{ color: "#1976d2", fontWeight: "bold", letterSpacing: 1 }}
          >
            DANH SÁCH NGƯỜI DÙNG
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2} minHeight={40}>
            <Button
              variant="outlined"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => handleThem()}
            >
              THÊM
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveAsOutlinedIcon />}
              disabled={!selectedUser || newUserStatus === 1}
              color="primary"
              onClick={() => handleLuu()}
            >
              LƯU
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseOutlinedIcon />}
              onClick={() => handleHuy()}
            >
              HUỶ
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonRemoveOutlinedIcon />}
              disabled={!selectedUser || selectedUser.cid === "0"}
              color="error"
              onClick={() => handleXoa()}
            >
              XOÁ
            </Button>
            <Button
              variant="outlined"
              startIcon={<PasswordIcon />}
              onClick={() => handleDoiMatKhau()}
              disabled={!selectedUser || newUserStatus === 1}
            >
              ĐỔI MẬT KHẨU
            </Button>
            <Button
              variant="outlined"
              startIcon={<ManageAccountsOutlinedIcon />}
              onClick={() => handlePhanQuyen()}
              disabled={!selectedUser || newUserStatus === 1}
            >
              PHÂN QUYỀN
            </Button>
          </Box>
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
        </Grid>

        {/* Form chi tiết */}
        <Grid
          size={4}
          className="h-full flex flex-col overflow-hidden bg-white"
        >
          <Typography
            variant="h6"
            mb={1}
            sx={{ color: "#1976d2", letterSpacing: 1 }}
            className="px-4 pt-4"
          >
            THÔNG TIN NGƯỜI DÙNG
          </Typography>
          <form className="h-full flex flex-col flex-1 overflow-hidden">
            <Box className="flex flex-col overflow-hidden">
              <Grid
                container
                spacing={2}
                className="flex-1 overflow-y-auto px-4"
              >
                <Grid size={12}>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: "small",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                      color: "#4d5052ff",
                      letterSpacing: 1,
                    }}
                  >
                    Khoa phòng
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedUser?.cmadonvi || ""}
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
                  <Typography
                    component="label"
                    sx={{
                      fontSize: "small",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                      color: "#4d5052ff",
                      letterSpacing: 1,
                    }}
                  >
                    Nhóm người dùng
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedUser?.cmanhomnguoidung || ""}
                    onChange={(e) =>
                      handleChange("cmanhomnguoidung", e.target.value)
                    }
                    displayEmpty
                  >
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                      }}
                    >
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
                        }}
                      >
                        Xác thực 2 lớp
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {newUserStatus === 1 && (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Mật khẩu *"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        handleChange("cmatkhau", e.target.value);
                      }}
                      placeholder="Nhập mật khẩu mới"
                      helperText="Mật khẩu phải có ít nhất 6 ký tự"
                      error={password.length > 0 && password.length < 6}
                    />
                  </Grid>
                )}
              </Grid>

              <Grid size={12} className="px-4 py-2"></Grid>
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
        {openChangePasswordDialog && (
          <DialogDoiMatKhau
            open={openChangePasswordDialog}
            onClose={() => setOpenChangePasswordDialog(false)}
            selectedUser={selectedUser}
            onSuccess={handlePasswordChangeSuccess}
          />
        )}
      </Grid>
    </LocalizationProvider>
  );
}
