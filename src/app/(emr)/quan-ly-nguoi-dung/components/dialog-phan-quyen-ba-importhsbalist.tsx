"use client";

import { getphanquyenbaDSSovaovien, luuphanquyenba } from "@/actions/act_tnguoidung";
import { IPhanQuyenHoSoBenhAn } from "@/model/tphanquyen";
import { IUserItem } from "@/model/tuser";
import { useUserStore } from "@/store/user";
import { ToastSuccess, ToastError } from "@/utils/toast";
import * as MuiIcons from "@mui/icons-material";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import React, { useState, useCallback } from "react";

// Component hiển thị danh sách HSBA từ Excel
interface ImportedHSBAListProps {
  open: boolean;
  onClose: () => void;
  importedSoVaoVienList: string[];
  selectedUser: IUserItem | null;
  onSuccess: () => void;  
  popt: string;
  fromDate: Date;
  toDate: Date;
}

const DialogPhanQuyenBaImportedHSBAList: React.FC<ImportedHSBAListProps> = ({
  open,
  onClose,
  importedSoVaoVienList,
  selectedUser,
  onSuccess,
  popt,
  fromDate,
  toDate,
}) => {
  const { data: loginedUser } = useUserStore();
  const [dsHSBAImported, setDsHSBAImported] = useState<IPhanQuyenHoSoBenhAn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Format date function
  const formatDate = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch HSBA từ danh sách số vào viện
  const fetchHSBAFromSoVaoVien = useCallback(async () => {
    if (!selectedUser || importedSoVaoVienList.length === 0 || !loginedUser) return;

    setIsLoadingData(true);
    try {
      // Chuyển mảng số vào viện thành chuỗi: "123,124,125,126"
      const soVaoVienString = importedSoVaoVienList.join(',');
      
      // Sử dụng popt từ component chính
      const searchPopt = popt;

      const result = await getphanquyenbaDSSovaovien(
        loginedUser.ctaikhoan,
        searchPopt,
        soVaoVienString,
        formatDate(fromDate), // Sử dụng fromDate từ component chính
        formatDate(toDate)    // Sử dụng toDate từ component chính
      );
      
      // Set trạng thái mặc định là phân quyền (ctrangthai = 1)
      const hsbaWithPermission = (result || []).map((item: IPhanQuyenHoSoBenhAn) => ({
        ...item,
        ctrangthai: 1
      }));
      
      setDsHSBAImported(hsbaWithPermission);
    } catch (error) {
      console.error("Error fetching HSBA from SoVaoVien:", error);
      ToastError("Lỗi khi tải danh sách HSBA từ số vào viện");
      setDsHSBAImported([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedUser, importedSoVaoVienList, loginedUser, popt, fromDate, toDate, formatDate]);

  // Effect để fetch data khi dialog mở
  React.useEffect(() => {
    if (open && importedSoVaoVienList.length > 0) {
      fetchHSBAFromSoVaoVien();
    }
  }, [open, fetchHSBAFromSoVaoVien, importedSoVaoVienList.length]);

  const handleCheckHSBA = (ID: string) => {
    setDsHSBAImported((prev) =>
      prev.map((row) =>
        row.ID === ID
          ? { ...row, ctrangthai: row.ctrangthai === 1 ? 0 : 1 }
          : row
      )
    );
  };

  const handleSelectAll = () => {
    const allChecked = dsHSBAImported.every((item: IPhanQuyenHoSoBenhAn) => item.ctrangthai === 1);
    setDsHSBAImported(prev =>
      prev.map(item => ({
        ...item,
        ctrangthai: allChecked ? 0 : 1
      }))
    );
  };

  const handleLuuPhanQuyenImported = async () => {
    if (!selectedUser || !loginedUser) return;
    
    setIsLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Lưu tất cả các HSBA đã được check
      for (const item of dsHSBAImported.filter((row) => row.ctrangthai === 1)) {
        try {
          await luuphanquyenba(
            loginedUser.ctaikhoan,
            "1",
            selectedUser.ctaikhoan,
            item.ID,
            "1"
          );
          successCount++;
        } catch (error) {
          console.error(`Error granting permission for HSBA ${item.ID}:`, error);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        ToastError(`Có ${errorCount} HSBA không thể phân quyền. Thành công: ${successCount}`);
      } else {
        ToastSuccess(`Đã phân quyền thành công cho ${successCount} HSBA`);
      }
      
      // Đóng dialog và reload data chính
      onClose();
      onSuccess();
      
    } catch (error) {
      console.error("Error saving imported permissions:", error);
      ToastError("Lỗi khi lưu phân quyền");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDsHSBAImported([]);
    onClose();
  };

  const isAllSelected = dsHSBAImported.length > 0 && dsHSBAImported.every(item => item.ctrangthai === 1);
  const isIndeterminate = dsHSBAImported.some(item => item.ctrangthai === 1) && !isAllSelected;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary">
            Danh sách HSBA từ file Excel ({importedSoVaoVienList.length} số vào viện)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Tìm kiếm theo: {popt === "1" ? "Ngày vào" : "Ngày ra"} từ {fromDate.toLocaleDateString()} đến {toDate.toLocaleDateString()}
          </Typography>
          <IconButton onClick={handleClose}>
            <MuiIcons.Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {isLoadingData ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="200px"
          >
            <Typography>Đang tải dữ liệu HSBA...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={40}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                      size="small"
                      disabled={dsHSBAImported.length === 0}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    Mã BA
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Số BHYT
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Số vào viện
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                    Họ tên
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Ngày sinh
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    Giới tính
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                    Địa chỉ
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                    Ngày vào
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                    Ngày ra
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                    Khoa điều trị
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dsHSBAImported.length > 0 ? (
                  dsHSBAImported.map((item) => (
                    <TableRow key={item.ID}>
                      <TableCell>
                        <Checkbox
                          checked={item.ctrangthai === 1}
                          onChange={() => handleCheckHSBA(item.ID)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.ID}</TableCell>
                      <TableCell>{item.SoVaoVien}</TableCell>
                      <TableCell>{item.Hoten}</TableCell>
                      <TableCell>{item.Ngaysinh}</TableCell>
                      <TableCell>{item.Gioitinh}</TableCell>
                      <TableCell
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 200,
                        }}
                        title={item.Diachi}
                      >
                        {item.Diachi}
                      </TableCell>
                      <TableCell>{item.NgayVao}</TableCell>
                      <TableCell>{item.NgayRa}</TableCell>
                      <TableCell>{item.KhoaDieuTri}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      Không tìm thấy HSBA nào với các số vào viện đã import
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          width="100%"
        >
          <Typography variant="body2" color="textSecondary">
            {dsHSBAImported.length > 0 && (
              <>
                Đã chọn: {dsHSBAImported.filter(item => item.ctrangthai === 1).length} / {dsHSBAImported.length}
              </>
            )}
          </Typography>
          
          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              onClick={handleClose} 
              disabled={isLoading}
            >
              Hủy          
            </Button>
            <Button
              variant="contained"
              onClick={handleLuuPhanQuyenImported}
              disabled={isLoading || dsHSBAImported.length === 0}
              startIcon={isLoading ? <MuiIcons.Refresh className="animate-spin" /> : <MuiIcons.Save />}
            >
              {isLoading ? "Đang lưu..." : "Lưu phân quyền"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DialogPhanQuyenBaImportedHSBAList);