// src/app/quan-ly-nguoi-dung/components/dialog-doi-mat-khau.tsx

"use client";

import {
  getphanquyenba,
  getphanquyenbakhoa,
  getphanquyenmenu,
  luuphanquyenba,
  luuphanquyenbakhoa,
  luuphanquyenmenu,
} from "@/actions/act_tnguoidung";
import { IMenuItem, IMenuTree } from "@/model/tmenu";
import { IPhanQuyenHoSoBenhAn, IPhanQuyenKhoa } from "@/model/tphanquyen";
import { IUserItem } from "@/model/tuser";
import { DataManager } from "@/services/DataManager";
import { useUserStore } from "@/store/user";
import { ToastSuccess } from "@/utils/toast";
import * as MuiIcons from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useCallback, useEffect, useState } from "react";

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

interface DialogPhanQuyenProps {
  open: boolean;
  onClose: () => void;
  selectedUser: IUserItem | null;
}

const DialogPhanQuyen: React.FC<DialogPhanQuyenProps> = ({
  open,
  onClose,
  selectedUser,
}) => {
  const { data: loginedUser } = useUserStore();
  const [khoaList, setKhoaList] = useState<{ value: string; label: string }[]>(
    []
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [dsQuyenKhoa, setDsQuyenKhoa] = useState<IPhanQuyenKhoa[]>([]);
  const [selectedKhoaBA, setSelectedKhoaBA] = useState("all");
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [popt, setPopt] = useState("3"); // 3: Ngày vào viện, 4: Ngày ra viện (dùng để phân quyền)
  const [dsHSBA, setDsHSBA] = useState<IPhanQuyenHoSoBenhAn[]>([]);
  // state cho danh sách menu phân quyền
  const [dsMenu, setDsMenu] = useState<IMenuItem[]>([]);

  const handleCheckMenu = (
    cid: number,
    checked: boolean,
    newMenuList: IMenuItem[]
  ) => {
    setDsMenu(newMenuList);
  };
  const handleLuuPhanQuyenMenu = async () => {
    if (!selectedUser) return;
    for (const item of dsMenu) {
      // Gọi API lưu phân quyền menu cho từng menu
      await luuphanquyenmenu(
        loginedUser.ctaikhoan,
        "2",
        selectedUser.ctaikhoan,
        item.cid,
        item.ctrangthai.toString()
      );
    }
    ToastSuccess("Lưu phân quyền menu thành công!");
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
    // console.log("Fetching HSBA with params:", {
    //   taikhoan: loginedUser.ctaikhoan,
    //   loai: "1",
    //   user: selectedUser.ctaikhoan,
    //   khoa: selectedKhoaBA,
    //   fromDate: formatDate(fromDate),
    //   toDate: formatDate(toDate),
    // });
    const result = await getphanquyenba(
      loginedUser.ctaikhoan,
      popt,
      selectedUser.ctaikhoan,
      selectedKhoaBA,
      formatDate(fromDate),
      formatDate(toDate)
    );
    // console.log("Danh sách HSBA:", result);
    setDsHSBA(result);
  };
  function MenuTree({
    menuList,
    onCheck,
  }: {
    menuList: IMenuItem[];
    onCheck: (cid: number, checked: boolean, newMenuList: IMenuItem[]) => void;
  }) {
    // Tạo cây từ danh sách phẳng, menu gốc có cidcha = "" hoặc "0"
    const buildTree = (list: IMenuItem[], parentId: number): IMenuTree[] =>
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
      nodes: IMenuTree[],
      cid: number,
      checked: boolean
    ): IMenuTree[] =>
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
    const updateAllChildren = (
      nodes: IMenuTree[],
      checked: boolean
    ): IMenuTree[] =>
      nodes.map((node) => ({
        ...node,
        ctrangthai: checked ? 1 : 0,
        children: node.children
          ? updateAllChildren(node.children, checked)
          : [],
      }));

    // Khi check/uncheck, cập nhật trạng thái cho node và các con
    const handleCheck = (cid: number, checked: boolean) => {
      const newTree = updateNodeCheck(tree, cid, checked);
      // Flatten tree về lại mảng phẳng để cập nhật dsMenu
      const flatten = (nodes: IMenuTree[]): IMenuItem[] =>
        nodes.reduce<IMenuItem[]>(
          (acc, node) => [
            ...acc,
            { ...node, children: undefined } as IMenuItem,
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
    const renderNode = (node: IMenuTree, level: number = 0) => (
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
        <Box sx={{ alignItems: "center", mr: 1, width: "100%" }}>
          <input
            type="checkbox"
            checked={node.ctrangthai === 1}
            onChange={(e) => handleCheck(node.cid, e.target.checked)}
            style={{ marginRight: 8, alignItems: "left", verticalAlign: "top" }}
          />
          {renderIcon(node.cicon)}
          <span
            style={{
              fontWeight: node.ccap === 1 ? "bold" : "normal",
              width: node.ccap === 1 ? "100%" : "100%",
            }}>
            {node.ctenmenu}
          </span>
        </Box>
        {node.children && node.children.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <span style={{ width: "100%" }}>
              {node.children.map((child: IMenuItem) =>
                renderNode(child, level + 1)
              )}
            </span>
          </Box>
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
    ToastSuccess("Lưu phân quyền BA thành công!");
  };

  const handleTabChange = async (_: unknown, newIndex: number) => {
    // console.log(
    //   "============== newIndex =============== ",
    //   newIndex,
    //   selectedUser
    // );
    setTabIndex(newIndex);
    // if (newIndex === 0 && selectedUser) {
    //   // Gọi API lấy danh sách menu phân quyền cho user
    //   const result = await getphanquyenmenu(
    //     loginedUser.ctaikhoan,
    //     "1",
    //     selectedUser.ctaikhoan
    //   );
    //   console.log("dsMenu phan quyen user", result);
    //   if (Array.isArray(result)) setDsMenu(result);
    //   else setDsMenu([]);
    // }
    // if (newIndex === 1 && selectedUser) {
    //   // Gọi API lấy danh sách phân quyền cho user theo HSBA
    // }
    // if (newIndex === 2 && selectedUser) {
    //   // Gọi API lấy danh sách quyền khoa của user
    //   const result = await getphanquyenbakhoa(
    //     loginedUser.ctaikhoan,
    //     "1",
    //     selectedUser.ctaikhoan
    //   );
    //   if (Array.isArray(result)) setDsQuyenKhoa(result);
    //   else setDsQuyenKhoa([]);
    // }
  };

  const GetBaKhoaPhanQuyen = useCallback(async () => {
    if (!selectedUser) return;

    if (tabIndex !== 2) return;

    const result = await getphanquyenbakhoa(
      loginedUser.ctaikhoan,
      "1",
      selectedUser.ctaikhoan
    );
    if (Array.isArray(result)) setDsQuyenKhoa(result);
    else setDsQuyenKhoa([]);
  }, [loginedUser, selectedUser, tabIndex]);

  useEffect(() => {
    GetBaKhoaPhanQuyen();
  }, [GetBaKhoaPhanQuyen]);

  const GetMenuPhanQuyen = useCallback(async () => {
    if (!selectedUser) return;

    if (tabIndex !== 0) return;

    const result = await getphanquyenmenu(
      loginedUser.ctaikhoan,
      "1",
      selectedUser.ctaikhoan
    );
    console.log("dsMenu phan quyen user", result);
    if (Array.isArray(result)) setDsMenu(result);
    else setDsMenu([]);
  }, [loginedUser, selectedUser, tabIndex]);

  useEffect(() => {
    GetMenuPhanQuyen();
  }, [GetMenuPhanQuyen]);

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
    ToastSuccess("Lưu phân quyền BA theo khoa thành công!");
  };

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
    fetchKhoaList();
  }, [fetchKhoaList]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}>
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
        <IconButton onClick={onClose}>
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
              <Typography fontWeight="bold" mb={2} sx={{ color: "#1976d2" }}>
                Danh sách chức năng
              </Typography>
              <MenuTree menuList={dsMenu} onCheck={handleCheckMenu} />
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button variant="contained" onClick={handleLuuPhanQuyenMenu}>
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
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  "& > *": {
                    minHeight: 40, // Consistent height cho tất cả components
                  },
                }}>
                <Select
                  size="small"
                  value={selectedKhoaBA}
                  onChange={(e) => setSelectedKhoaBA(e.target.value)}
                  displayEmpty
                  sx={{
                    minWidth: 200,
                    height: 40,
                    "& .MuiSelect-select": {
                      fontSize: "0.875rem",
                    },
                  }}>
                  {khoaList.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>

                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <FormControl>
                    <FormLabel
                      id="popt-radio-group-label"
                      sx={{
                        color: "#1976d2",
                        fontWeight: "italic",
                        fontSize: "0.675rem",
                        mb: 0.5,
                      }}></FormLabel>
                    <RadioGroup
                      row
                      aria-labelledby="popt-radio-group-label"
                      name="popt-radio-group"
                      value={popt}
                      onChange={(e) => setPopt(e.target.value)}>
                      <FormControlLabel
                        value="1"
                        control={
                          <Radio
                            sx={{
                              color: "#1976d2",
                              "&.Mui-checked": { color: "#1976d2" },
                            }}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            Ngày vào
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="2"
                        control={
                          <Radio
                            sx={{
                              color: "#1976d2",
                              "&.Mui-checked": { color: "#1976d2" },
                            }}
                            size="small"
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            Ngày ra
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                  <DatePicker
                    label="Từ ngày"
                    value={fromDate}
                    onChange={(value) => {
                      if (value !== null) setFromDate(value as Date);
                    }}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 150,
                          "& .MuiInputBase-root": {
                            fontSize: "0.875rem",
                            height: 40,
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                          },
                        },
                      },
                    }}
                  />

                  <DatePicker
                    label="Đến ngày"
                    value={toDate}
                    onChange={(value) => {
                      if (value !== null) setToDate(value as Date);
                    }}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 150,
                          "& .MuiInputBase-root": {
                            fontSize: "0.875rem",
                            height: 40,
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                          },
                        },
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<MuiIcons.Search />}
                    onClick={fetchHSBA}
                    size="small"
                    sx={{
                      height: 40,
                      minWidth: 100,
                      fontSize: "0.875rem",
                    }}>
                    Tìm kiếm
                  </Button>
                </Box>
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
              <Typography fontWeight="bold" mb={2} sx={{ color: "#1976d2" }}>
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
                <Button variant="contained" onClick={handleLuuPhanQuyenKhoa}>
                  LƯU
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(DialogPhanQuyen);
