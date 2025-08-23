// src/app/quan-ly-nguoi-dung/page.tsx
"use client";

import {
  gettnguoidung,
  gettnhomnguoidung,
  instnguoidung,
} from "@/actions/act_tnguoidung";
import HeadMetadata from "@/components/HeadMetadata";
import AccessDeniedPage from "@/components/AccessDeniedPage";
import { ITnhomNguoiDung } from "@/model/tnhomnguoidung";
import { IUserItem } from "@/model/tuser";
import { ISelectOption } from "@/model/ui";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DialogDoiMatKhau from "./components/dialog-doi-mat-khau";
import DialogPhanQuyen from "./components/dialog-phan-quyen";
import { useMenuStore } from "@/store/menu";

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
];

export default function PageQuanLyNguoiDung() {
  const router = useRouter();
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const { data: loginedUser } = useUserStore();
  const { data: menuData } = useMenuStore();
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
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const checkAccess = () => {
      // Kiểm tra xem có quyền truy cập trang "quan-ly-nguoi-dung" không
      if (menuData.find((item) => item.clink === "quan-ly-nguoi-dung")) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
        // Không redirect, chỉ set hasAccess = false để hiển thị AccessDeniedPage
      }
      setIsCheckingAccess(false);
    };

    // Chỉ kiểm tra khi đã có dữ liệu từ store
    if (loginedUser && menuData !== undefined) {
      checkAccess();
    }
  }, [menuData, loginedUser, router]);

  const fetchUsers = useCallback(async () => {
    if (!loginedUser || !loginedUser.ctaikhoan || !hasAccess) return;
    
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
  }, [loginedUser, hasAccess]);

  const fetchNhomNguoiDungList = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const result = await gettnhomnguoidung(loginedUser.ctaikhoan, "1");

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
    } catch (error) {
      console.error("Error fetching nhom nguoi dung:", error);
      setNhomNguoiDungList([{ value: "", label: "Chọn nhóm người dùng" }]);
    }
  }, [loginedUser, hasAccess]);

  const fetchKhoaList = useCallback(async () => {
    if (!hasAccess) return;
    
    try {
      const dataKhoaPhong = await DataManager.getDmKhoaPhong();
      setKhoaList(dataKhoaPhong);
    } catch (error) {
      console.error("Error fetching khoa list:", error);
      setKhoaList([{ value: "all", label: "Tất cả" }]);
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess && !isCheckingAccess) {
      fetchUsers();
      fetchNhomNguoiDungList();
      fetchKhoaList();
    }
  }, [fetchUsers, fetchNhomNguoiDungList, fetchKhoaList, hasAccess, isCheckingAccess]);

  const handleRowClick = (user: IUserItem) => {
    if (!hasAccess) return;
    
    setSelectedUser(user);
    setNewUserStatus(0);
    setPassword("");
  };

  const handleChange = (field: string, value: string) => {
    if (!hasAccess) return;
    
    setSelectedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as IUserItem;
    });
  };

  const handleThem = async () => {
    if (!hasAccess) return;
    
    setNewUserStatus(1);
    setPassword("");
    setSelectedUser({
      cid: "0",
      ctaikhoan: "",
      cmatkhau: "",
      choten: "",
      cngaysinh: new Date().toISOString().split("T")[0],
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
    if (!hasAccess) return;
    
    if (newUserStatus === 1) {
      if (!selectedUser || !selectedUser.ctaikhoan || !selectedUser.cmatkhau) {
        ToastWarning("Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu");
        return;
      }

      if (!password || password.length < 6) {
        ToastWarning("Vui lòng nhập mật khẩu có ít nhất 6 ký tự");
        return;
      }

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
        setPassword("");
      } else {
        ToastError("Thêm người dùng thất bại");
      }
    } else if (newUserStatus === 0) {
      if (!selectedUser) return;
      const result = await instnguoidung(
        loginedUser.ctaikhoan,
        "2",
        selectedUser
      );
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

  const handleHuy = () => {
    if (!hasAccess) return;
    
    setSelectedUser(null);
    setNewUserStatus(0);
    setPassword("");
  };

  const handleXoa = async () => {
    if (!hasAccess) return;
    
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

  const handleDoiMatKhau = async () => {
    if (!hasAccess) return;
    
    if (!selectedUser) {
      ToastWarning("Vui lòng chọn người dùng cần đổi mật khẩu!");
      return;
    }
    setOpenChangePasswordDialog(true);
  };

  const handlePasswordChangeSuccess = (updatedUser: IUserItem) => {
    setSelectedUser(updatedUser);
    setUsers((prev) =>
      prev.map((user) => (user.cid === updatedUser.cid ? updatedUser : user))
    );
  };

  const handlePhanQuyen = () => {
    if (!hasAccess) return;
    
    if (!selectedUser) return;
    setOpenPhanQuyen(true);
  };

  const handleClosePhanQuyen = () => {
    setOpenPhanQuyen(false);
  };

  // Hiển thị loading khi đang kiểm tra quyền truy cập
  if (isCheckingAccess) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography color="textSecondary">Đang kiểm tra quyền truy cập...</Typography>
      </Box>
    );
  }

  // Hiển thị trang Access Denied nếu không có quyền
  if (!hasAccess) {
    return (
      <AccessDeniedPage
        title="BẠN KHÔNG CÓ QUYỀN QUẢN LÝ NGƯỜI DÙNG"
        message="Bạn không có quyền truy cập chức năng quản lý người dùng. Vui lòng liên hệ quản trị viên để được cấp quyền."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <HeadMetadata title="Danh sách người dùng" />
      
      {/* Container chính với height cố định */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 64px)', // Trừ height của header/navbar
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          p: 1,
          gap: 1
        }}
      >
        {/* Bảng danh sách */}
        <Box 
          sx={{
            width: '66.66%', // 8/12 của Grid
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white',
            p: 2,
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Typography
            variant="h6"
            mb={1}
            sx={{ 
              color: "#1976d2", 
              fontWeight: "bold", 
              letterSpacing: 1,
              flexShrink: 0
            }}
          >
            DANH SÁCH NGƯỜI DÙNG
          </Typography>
          
          {/* Button toolbar */}
          <Box 
            display="flex" 
            gap={1} 
            flexWrap="wrap" 
            mb={2} 
            sx={{ 
              minHeight: 40,
              flexShrink: 0
            }}
          >
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

          {/* DataGrid container với height cố định */}
          <Box 
            sx={{
              flex: 1,
              width: '100%',
              minHeight: 400, // Đảm bảo có chiều cao tối thiểu
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}
          >
            <DataGrid
              rows={users}
              columns={columns}
              pagination
              density="compact"
              onRowClick={(params) => handleRowClick(params.row as IUserItem)}
              loading={loadingUser}
              sx={{
                height: '100%',
                '& .MuiDataGrid-main': {
                  overflow: 'hidden'
                }
              }}
            />
          </Box>
        </Box>

        {/* Form chi tiết */}
        <Box
          sx={{
            width: '33.33%', // 4/12 của Grid
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Typography
            variant="h6"
            mb={1}
            sx={{ 
              color: "#1976d2", 
              letterSpacing: 1,
              flexShrink: 0,
              px: 2,
              pt: 2
            }}
          >
            THÔNG TIN NGƯỜI DÙNG
          </Typography>
          
          <Box 
            component="form" 
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                pb: 2
              }}
            >
              <Grid container spacing={2}>
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
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dialogs */}
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
    </LocalizationProvider>
  );
}