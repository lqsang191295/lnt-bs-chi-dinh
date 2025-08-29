"use client";

import {
  getphanquyenbakhoa,
  luuphanquyenbakhoa,
} from "@/actions/act_tnguoidung";
import { IPhanQuyenKhoa } from "@/model/tphanquyen";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import { ToastSuccess } from "@/utils/toast";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

interface DialogPhanQuyenBaKhoaProps {
  selectedUser: IUserItem | null;
}

const DialogPhanQuyenBaKhoa: React.FC<DialogPhanQuyenBaKhoaProps> = ({
  selectedUser,
}) => {
  const { data: loginedUser } = useUserStore();
  const [dsQuyenKhoa, setDsQuyenKhoa] = useState<IPhanQuyenKhoa[]>([]);

  const handleLuuPhanQuyenKhoa = async () => {
    if (!selectedUser) return;
    for (const item of dsQuyenKhoa) {
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

  const GetBaKhoaPhanQuyen = useCallback(async () => {
    if (!selectedUser) return;

    const result = await getphanquyenbakhoa(
      loginedUser.ctaikhoan,
      "1",
      selectedUser.ctaikhoan
    );
    if (Array.isArray(result)) setDsQuyenKhoa(result);
    else setDsQuyenKhoa([]);
  }, [loginedUser, selectedUser]);

  useEffect(() => {
    GetBaKhoaPhanQuyen();
  }, [GetBaKhoaPhanQuyen]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ccc",
        borderRadius: 2,
        bgcolor: "#fff",
        overflow: "hidden",
      }}>
      {/* <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography fontWeight="bold" sx={{ color: "#1976d2" }}>
          Danh sách khoa
        </Typography>
      </Box> */}

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TableContainer sx={{ height: "100%" }}>
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
                  }}
                />
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
                                  ctrangthai: row.ctrangthai === 1 ? 0 : 1,
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
      </Box>

      <Box
        sx={{
          p: 2,
          textAlign: "right",
          flexShrink: 0,
          borderTop: "1px solid #eee",
        }}>
        <Button variant="contained" onClick={handleLuuPhanQuyenKhoa}>
          LƯU
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(DialogPhanQuyenBaKhoa);
