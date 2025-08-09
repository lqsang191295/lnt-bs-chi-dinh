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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { get } from "http";
import { useRouter } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import * as MuiIcons from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import Draggable from "react-draggable";
import { IUserItem } from "@/model/user";
import { useUserStore } from "@/store/user";
import { getClaimsFromToken } from "@/utils/auth"; // Assuming you have a utility function to decode JWT
import { gettDMKhoaPhongs } from "@/actions/emr_tdmkhoaphong";
import {
  instnguoidung,
  gettnguoidung,
  gettnhomnguoidung,
  getphanquyenbakhoa,
  luuphanquyenbakhoa,
  getphanquyenmenu,
  luuphanquyenmenu,
  getphanquyenba,
  luuphanquyenba,
} from "@/actions/emr_tnguoidung";
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

// Wrapper cho DialogContent để resize
const ResizablePaper = React.forwardRef(function ResizablePaper(
  props: any,
  ref
) {
  return (
    <Paper
      ref={ref}
      {...props}
      style={{
        resize: "both",
        overflow: "auto",
        minWidth: 1024,
        minHeight: 768,
        maxWidth: "100vw",
        maxHeight: "100vh",
        ...props.style,
      }}
    />
  );
});

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

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserItem | null>(null);
  const { data: loginedUser, setUserData } = useUserStore();
  const [nhomNguoiDungList, setNhomNguoiDungList] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedNhomNguoiDung, setSelectedNhomNguoiDung] = useState("");
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [page, setPage] = useState(0);
  const [newUserStatus, setNewUserStatus] = useState(0);
  const [password, setPassword] = useState("");
  const [openPhanQuyen, setOpenPhanQuyen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [dsQuyenKhoa, setDsQuyenKhoa] = useState<
    {
      cthutu: string;
      cidquyen: string;
      cidkhoa: string;
      cmakhoa: string;
      ctenkhoa: string;
      ckyhieu: string;
      ctrangthai: number;
    }[]
  >([]);
  // State cho tab phân quyền BA
  const [selectedKhoaBA, setSelectedKhoaBA] = useState("all");
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [dsHSBA, setDsHSBA] = useState<
    {
      ID: string;
      SoBenhAn: string;
      hoten: string;
      Ngaysinh: string;
      Gioitinh: string;
      Diachi: string;
      SoVaoVien: string;
      NgayVao: string;
      NgayRa: string;
      KhoaDieuTri: string;
      ctrangthai: number;
    }[]
  >([]);
  // state cho danh sách menu phân quyền
  const [dsMenu, setDsMenu] = useState<
    {
      cid: string;
      cthutu: string;
      cmamenu: string;
      ctenmenu: string;
      clink: string;
      ccap: number;
      cidcha: string;
      cicon: string;
      ctrangthai: number;
    }[]
  >([]);

  const handleCheckMenu = (
    cid: string,
    checked: boolean,
    newMenuList: any[]
  ) => {
    setDsMenu(newMenuList);
  };
  const handleLuuPhanQuyenMenu = async () => {
    if (!selectedUser) return;
    for (const item of dsMenu) {
      // Gọi API lưu phân quyền menu cho từng menu
      await luuphanquyenmenu(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan,
        item.cid,
        item.ctrangthai.toString()
      );
    }
    alert("Lưu phân quyền menu thành công!");
  };
  // Hàm lấy danh sách HSBA theo filter
  const fetchHSBA = async () => {
    // TODO: Gọi API lấy danh sách HSBA theo selectedKhoaBA, fromDate, toDate
    if (!selectedUser) return;
    if (!fromDate || !toDate) return;
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const result = await getphanquyenba(
      loginedUser.ctaikhoan,
      "1",
      selectedUser.ctaikhoan,
      selectedKhoaBA,
      formatDate(fromDate),
      formatDate(toDate)
    );
    //console.log("Danh sách HSBA:", result);
    setDsHSBA(result);
  };
  function MenuTree({
    menuList,
    onCheck,
  }: {
    menuList: any[];
    onCheck: (cid: string, checked: boolean, newMenuList: any[]) => void;
  }) {
    // Tạo cây từ danh sách phẳng, menu gốc có cidcha = "" hoặc "0"
    const buildTree = (list: any[], parentId: number): any[] =>
      list
        .filter((item) => item.cidcha === parentId)
        .sort((a, b) => Number(a.cthutu) - Number(b.cthutu))
        .map((item) => ({
          ...item,
          children: buildTree(list, item.cid),
        }));

    const tree = buildTree(menuList, 0);

    // Hàm cập nhật trạng thái cho node và các con
    const updateNodeCheck = (
      nodes: any[],
      cid: string,
      checked: boolean
    ): any[] =>
      nodes.map((node) => {
        if (node.cid === cid) {
          return {
            ...node,
            ctrangthai: checked ? 1 : 0,
            children: node.children
              ? updateAllChildren(node.children, checked)
              : [],
          };
        }
        return {
          ...node,
          children: node.children
            ? updateNodeCheck(node.children, cid, checked)
            : [],
        };
      });

    // Hàm cập nhật tất cả các con
    const updateAllChildren = (nodes: any[], checked: boolean): any[] =>
      nodes.map((node) => ({
        ...node,
        ctrangthai: checked ? 1 : 0,
        children: node.children
          ? updateAllChildren(node.children, checked)
          : [],
      }));

    // Khi check/uncheck, cập nhật trạng thái cho node và các con
    const handleCheck = (cid: string, checked: boolean) => {
      const newTree = updateNodeCheck(tree, cid, checked);
      // Flatten tree về lại mảng phẳng để cập nhật dsMenu
      const flatten = (nodes: any[]): any[] =>
        nodes.reduce(
          (acc, node) => [
            ...acc,
            { ...node, children: undefined },
            ...(node.children ? flatten(node.children) : []),
          ],
          []
        );
      const newMenuList = flatten(newTree);
      // Cập nhật trạng thái cho dsMenu
      onCheck(cid, checked, newMenuList);
    };

    // Hàm render icon từ node.cicon
    const renderIcon = (iconName: string) => {
      const IconComponent =
        MuiIcons[iconName.replace("Icon", "") as keyof typeof MuiIcons];
      return IconComponent ? (
        <IconComponent fontSize="small" sx={{ mr: 1 }} />
      ) : null;
    };

    // Render node
    const renderNode = (node: any, level: number = 0) => (
      <Box
        key={node.cid}
        sx={{
          pl: 2 + level * 2,
          display: "flex",
          flexDirection: "row",
          alignContent: "top",
          alignItems: "top",
          py: 0.5,
          borderBottom: "1px solid #eee",
          bgcolor: "transparent",
        }}>
        {/* Checkbox cho node */}
        <Box sx={{ alignItems: "center", mr: 1, width: "8%" }}>
          <input
            type="checkbox"
            checked={node.ctrangthai === 1}
            onChange={(e) => handleCheck(node.cid, e.target.checked)}
            style={{ marginRight: 8, alignItems: "left", verticalAlign: "top" }}
          />
          {renderIcon(node.cicon)}
        </Box>
        <span
          style={{
            fontWeight: node.ccap === 1 ? "bold" : "normal",
            width: node.ccap === 1 ? "14%" : "78%",
          }}>
          {node.ctenmenu}
        </span>
        {node.children && node.children.length > 0 && (
          //  <Box sx={{  display: "flex", flexDirection: "column", width: "78%" }}>
          <span style={{ width: "78%" }}>
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </span>
          //  </Box>
        )}
      </Box>
    );
    return <Box sx={{ pl: 1 }}>{tree.map((node) => renderNode(node))}</Box>;
  }

  // Hàm xử lý chọn/bỏ chọn HSBA
  const handleCheckHSBA = (ID: string) => {
    setDsHSBA((prev) =>
      prev.map((row) =>
        row.ID === ID
          ? { ...row, ctrangthai: row.ctrangthai === 1 ? 0 : 1 }
          : row
      )
    );
  };

  // Hàm lưu phân quyền BA
  const handleLuuPhanQuyenBA = async () => {
    if (!selectedUser) return;
    for (const item of dsHSBA.filter((row) => row.ctrangthai === 1)) {
      // TODO: Gọi API lưu phân quyền BA cho user
      await luuphanquyenba(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan,
        item.ID,
        item.ctrangthai.toString()
      );
    }
    alert("Lưu phân quyền BA thành công!");
  };
  // Thêm state lưu danh sách khoa được chọn
  const [phanQuyenKhoaChecked, setPhanQuyenKhoaChecked] = useState<string[]>(
    []
  );
  const handleTabChange = async (_: any, newIndex: number) => {
    setTabIndex(newIndex);
    if (newIndex === 0 && selectedUser) {
      // Gọi API lấy danh sách menu phân quyền cho user
      const result = await getphanquyenmenu(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan
      ); // Viết hàm này theo API của bạn
      //console.log("dsMenu phan quyen user", result);
      if (Array.isArray(result)) setDsMenu(result);
      else setDsMenu([]);
    }
    if (newIndex === 1 && selectedUser) {
      // Gọi API lấy danh sách phân quyền cho user theo HSBA
    }
    if (newIndex === 2 && selectedUser) {
      // Gọi API lấy danh sách quyền khoa của user
      const result = await getphanquyenbakhoa(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan
      ); // Hàm này bạn tự viết
      if (Array.isArray(result)) setDsQuyenKhoa(result);
      else setDsQuyenKhoa([]);
    }
  };
  // Hàm xử lý chọn/bỏ chọn khoa
  const handleCheckKhoa = (cid: string) => {
    setPhanQuyenKhoaChecked((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  // Hàm lưu phân quyền
  const handleLuuPhanQuyenKhoa = async () => {
    if (!selectedUser) return;
    // Lặp từng dòng dsQuyenKhoa, chỉ lấy dòng có thay đổi trạng thái
    for (const item of dsQuyenKhoa) {
      // Gọi API lưu phân quyền cho từng khoa
      await luuphanquyenbakhoa(
        loginedUser.ctaikhoan,
        "1",
        selectedUser.ctaikhoan,
        item.cmakhoa,
        item.ctrangthai.toString()
      );
    }
    alert("Lưu phân quyền BA theo khoa thành công!");
  };

  const handlePhanQuyen = () => {
    if (!selectedUser) return;
    setOpenPhanQuyen(true);
  };

  const handleClosePhanQuyen = () => {
    setOpenPhanQuyen(false);
  };
  useEffect(() => {
    // if (!loginedUser || !loginedUser.ctaikhoan) {
    //   router.push("/login"); // <-- Chuyển hướng nếu chưa đăng nhập
    //   return;
    // }
    const claims = getClaimsFromToken();
    if (claims) {
      // Log or handle the claims as needed
      console.log("User claims:", claims);
      // You can set user claims in a global state or context if needed
      setUserData(claims);
      console.log("loginedUser:", loginedUser);
    } else {
      console.warn("No valid claims found in token");
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
          setNhomNguoiDungList([
            { value: "", label: "Chọn nhóm người dùng" },
            ...mapped,
          ]);
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
          setKhoaList([{ value: "all", label: "Tất cả" }, ...mapped]);
        } else {
          setKhoaList([{ value: "all", label: "Tất cả" }]);
        }
      } catch (error) {
        setKhoaList([{ value: "all", label: "Tất cả" }]);
      }
    }
    fetchKhoaList();
  }, []);

  const handleRowClick = (user: any) => {
    setSelectedUser(user);
    // console.log("manhomnguoidung", user.cmanhomnguoidung);
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
      console.log("result", result);
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

  const taikhoans: { field: keyof IUserItem; label: string; type?: string }[] =
    [
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
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <TableContainer
            component={Paper}
            className="h-full overflow-hidden relative flex-1 box-shadow flex flex-col"
            sx={{ boxShadow: "none" }}>
            <Table
              size="small"
              aria-label="customized table"
              sx={{
                // border: "1px solid #ccc",
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
              className="overflow-hidden"
            />
          </TableContainer>
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
                    value={
                      khoaList.some(
                        (item) => item.value === selectedUser?.cmadonvi
                      )
                        ? selectedUser?.cmadonvi
                        : ""
                    }
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
                    value={
                      nhomNguoiDungList.some(
                        (item) => item.value === selectedUser?.cmanhomnguoidung
                      )
                        ? selectedUser?.cmanhomnguoidung
                        : ""
                    }
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
        <Dialog
          open={openPhanQuyen}
          onClose={handleClosePhanQuyen}
          maxWidth={false}
          slots={{ paper: ResizablePaper }}
          slotProps={{
            paper: {
              component: (props: any) => (
                <Draggable
                  handle="#draggable-dialog-title"
                  cancel={'[class*="MuiDialogContent-root"]'}>
                  <div {...props} />
                </Draggable>
              ),
            },
          }}>
          <DialogTitle
            id="draggable-dialog-title"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "move", // Hiện icon move khi hover tiêu đề
              userSelect: "none",
            }}>
            <Typography fontWeight="bold">PHÂN QUYỀN NGƯỜI DÙNG</Typography>
            <IconButton onClick={handleClosePhanQuyen}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ minHeight: 500, display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1, bgcolor: "#f7f7f7", p: 2, borderRadius: 2 }}>
              <Typography fontWeight="bold" mb={2}>
                THÔNG TIN NGƯỜI DÙNG
              </Typography>
              <Typography>Họ tên: {selectedUser?.choten}</Typography>
              <Typography>Tài khoản: {selectedUser?.ctaikhoan}</Typography>
              <Typography>
                {" "}
                Đơn vị:{" "}
                {khoaList.find((item) => item.value === selectedUser?.cmadonvi)
                  ?.label || ""}
              </Typography>
            </Box>
            <Box sx={{ flex: 3 }}>
              <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Phân quyền chức năng" />
                <Tab label="Phân quyền theo HSBA" />
                <Tab label="Phân quyền HSBA theo khoa" />
              </Tabs>
              <TabPanel value={tabIndex} index={0}>
                {/* TODO: Phân quyền chức năng */}
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#fff",
                    maxHeight: 400,
                    overflowY: "auto",
                  }}>
                  <Typography
                    fontWeight="bold"
                    mb={2}
                    sx={{ color: "#1976d2" }}>
                    Danh sách chức năng
                  </Typography>
                  <MenuTree menuList={dsMenu} onCheck={handleCheckMenu} />
                  <Box sx={{ textAlign: "right", mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleLuuPhanQuyenMenu}>
                      LƯU
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                {/* TODO: Phân quyền BA */}
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#fff",
                  }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Select
                      size="small"
                      value={selectedKhoaBA}
                      onChange={(e) => setSelectedKhoaBA(e.target.value)}
                      displayEmpty
                      sx={{ minWidth: 200 }}>
                      {khoaList.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <DatePicker
                      label="Từ ngày"
                      value={fromDate}
                      onChange={(value) => {
                        if (value !== null) setFromDate(value as Date);
                      }}
                      format="dd/MM/yyyy"
                    />
                    <DatePicker
                      label="Đến ngày"
                      value={toDate}
                      onChange={(value) => {
                        if (value !== null) setToDate(value as Date);
                      }}
                      format="dd/MM/yyyy"
                    />
                    <Button variant="contained" onClick={fetchHSBA}>
                      Tìm kiếm
                    </Button>
                  </Box>
                  <TableContainer
                    sx={{ maxHeight: 440, flex: 1, overflowY: "auto" }}>
                    <Table size="small" sx={{ border: "1px solid #eee" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            width={40}
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}></TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Mã BA
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Số vào viện
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Họ tên
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Ngày sinh
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Giới tính
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Địa chỉ
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Ngày vào viện
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Ngày ra viện
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Khoa điều trị
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(dsHSBA) && dsHSBA.length > 0 ? (
                          dsHSBA.map((item) => (
                            <TableRow key={item.ID} sx={{ cursor: "pointer" }}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={item.ctrangthai === 1}
                                  onChange={() => handleCheckHSBA(item.ID)}
                                />
                              </TableCell>
                              <TableCell>{item.ID}</TableCell>
                              <TableCell>{item.SoVaoVien}</TableCell>
                              <TableCell>{item.hoten}</TableCell>
                              <TableCell>{item.Ngaysinh}</TableCell>
                              <TableCell>{item.Gioitinh}</TableCell>
                              <TableCell>{item.Diachi}</TableCell>
                              <TableCell>{item.NgayVao}</TableCell>
                              <TableCell>{item.NgayRa}</TableCell>
                              <TableCell>{item.KhoaDieuTri}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={10} align="center">
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ textAlign: "right", mt: 2 }}>
                    <Button variant="contained" onClick={handleLuuPhanQuyenBA}>
                      LƯU
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                {/* TODO: Phân quyền BA theo khoa */}
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#fff",
                  }}>
                  <Typography
                    fontWeight="bold"
                    mb={2}
                    sx={{ color: "#1976d2" }}>
                    Danh sách khoa
                  </Typography>
                  <TableContainer
                    sx={{ maxHeight: 440, flex: 1, overflowY: "auto" }}>
                    <Table size="small" sx={{ border: "1px solid #eee" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            width={40}
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}></TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Ký hiệu
                          </TableCell>
                          <TableCell
                            sx={{
                              position: "sticky",
                              top: 0,
                              background: "#fff",
                              fontWeight: "bold",
                              zIndex: 1,
                            }}>
                            Tên khoa
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dsQuyenKhoa.map((item) => (
                          <TableRow key={item.cidkhoa}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={item.ctrangthai === 1}
                                onChange={() => {
                                  setDsQuyenKhoa((prev) =>
                                    prev.map((row) =>
                                      row.cidkhoa === item.cidkhoa
                                        ? {
                                            ...row,
                                            ctrangthai:
                                              row.ctrangthai === 1 ? 0 : 1,
                                          }
                                        : row
                                    )
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell>{item.ckyhieu}</TableCell>
                            <TableCell>{item.ctenkhoa}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ textAlign: "right", mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleLuuPhanQuyenKhoa}>
                      LƯU
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          </DialogContent>
        </Dialog>
      </Grid>
    </LocalizationProvider>
  );
}
