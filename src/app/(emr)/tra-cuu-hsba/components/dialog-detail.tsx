"use client";

import { PdfComponents } from "@/components/pdfComponents";
import { IHoSoBenhAn } from "@/model/thosobenhan";
import { IHoSoBenhAnChiTiet } from "@/model/thosobenhan_chitiet";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import React, { memo, useCallback, useEffect } from "react";

// Columns cho lưới chi tiết phiếu
const phieuColumns: GridColDef[] = [
  { field: "Stt", headerName: "STT", width: 60 },
  { field: "TenPhieu", headerName: "Loại Phiếu", width: 250 },
  { field: "NgayTaoPhieu", headerName: "Ngày Tạo", width: 150 },
  { field: "NgayKySo", headerName: "Ngày Ký", width: 150 },
];

interface DsMuonHsbaProps {
  open: boolean;
  onClose: () => void;
  selectedHsbaForDetail: IHoSoBenhAn | null;
  phieuList: IHoSoBenhAnChiTiet[];
}

const DialogDetail: React.FC<DsMuonHsbaProps> = ({
  open,
  onClose,
  selectedHsbaForDetail,
  phieuList,
}) => {
  // Sử dụng custom hook
  const { isLoading, pdfUrl, printPdf, createPdfUrl, cleanup } = PdfComponents({
    onSuccess: (message) => alert(message),
    onError: (error) => alert(error),
  });

  // Hàm in PDF từ selectedHsbaForDetail.NoiDungPdf
  const handlePrintHSBA = useCallback(async () => {
    if (!selectedHsbaForDetail?.NoiDungPdf) {
      alert("Không có dữ liệu PDF để in!");
      return;
    }

    // Kiểm tra trạng thái kết xuất
    if (selectedHsbaForDetail.TrangThaiKetXuat?.toString() !== "1") {
      alert("Hồ sơ này chưa được kết xuất! Không thể in.");
      return;
    }

    const fileName = `HSBA_${selectedHsbaForDetail.MaBN}_${selectedHsbaForDetail.Hoten}`;
    await printPdf(selectedHsbaForDetail.NoiDungPdf, fileName);
  }, [selectedHsbaForDetail, printPdf]);

  // Hàm xuất XML từ selectedHsbaForDetail.NoiDungXml
  const handleExportXML = useCallback(() => {
    if (!selectedHsbaForDetail?.NoiDungXml) {
      alert("Không có dữ liệu XML để xuất!");
      return;
    }

    // Kiểm tra trạng thái kết xuất
    if (selectedHsbaForDetail.TrangThaiKetXuat?.toString() !== "1") {
      alert("Hồ sơ này chưa được kết xuất! Không thể xuất XML.");
      return;
    }

    try {
      // Tạo blob từ nội dung XML
      const xmlBlob = new Blob([selectedHsbaForDetail.NoiDungXml], {
        type: "application/xml;charset=utf-8",
      });

      // Tạo URL và tải file
      const blobUrl = URL.createObjectURL(xmlBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `HSBA_${selectedHsbaForDetail.MaBN}_${selectedHsbaForDetail.Hoten}.xml`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      alert("Đã tải file XML thành công!");
    } catch (error) {
      console.error("Error exporting XML:", error);
      alert("Có lỗi khi xuất XML!");
    }
  }, [selectedHsbaForDetail]);

  // Hàm xử lý khi click vào một phiếu trong lưới chi tiết
  const handlePhieuRowClick = useCallback(
    (params: GridRowParams) => {
      const base64Data = params.row.FilePdfKySo;
      if (base64Data) {
        createPdfUrl(base64Data);
      }
    },
    [createPdfUrl]
  );

  // Hàm đóng dialog chi tiết
  const handleCloseDetailDialog = useCallback(() => {
    cleanup(); // Clean up PDF URLs
    if (onClose) onClose();
  }, [cleanup, onClose]);

  // Load PDF đầu tiên khi phieuList thay đổi
  useEffect(() => {
    if (!phieuList || phieuList.length === 0) {
      return;
    }

    const base64Data = phieuList[0].FilePdfKySo;
    if (base64Data) {
      createPdfUrl(base64Data);
    }
  }, [phieuList, createPdfUrl]); // Chỉ dependency phieuList, không có createPdfUrl

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]); // Empty dependency array

  // console.log("Selected HSBA for Detail:", pdfUrl);

  return (
    <Dialog
      open={open}
      onClose={handleCloseDetailDialog}
      fullWidth
      maxWidth="xl">
      <DialogTitle
        sx={{
          fontWeight: "bold",
          backgroundColor: "#1976d2",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        CHI TIẾT HỒ SƠ BỆNH ÁN: {selectedHsbaForDetail?.Hoten} -{" "}
        {selectedHsbaForDetail?.MaBN}
        {/* Hiển thị trạng thái kết xuất */}
        {selectedHsbaForDetail?.TrangThaiKetXuat?.toString() === "1" && (
          <Typography
            variant="caption"
            sx={{
              backgroundColor: "rgba(76, 175, 80, 0.8)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              ml: 2,
            }}>
            ✓ Đã kết xuất
          </Typography>
        )}
        <IconButton onClick={handleCloseDetailDialog} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 0,
          m: 0,
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        }}>
        {/* Vùng 1: Các nút chức năng */}
        <Box
          sx={{
            p: 1,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            gap: 1,
          }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintHSBA}
            disabled={
              isLoading ||
              !selectedHsbaForDetail?.NoiDungPdf ||
              selectedHsbaForDetail?.TrangThaiKetXuat?.toString() !== "1"
            }
            title={
              selectedHsbaForDetail?.TrangThaiKetXuat?.toString() !== "1"
                ? "Hồ sơ chưa được kết xuất"
                : "In hồ sơ bệnh án"
            }>
            {isLoading ? "Đang xử lý..." : "In HSBA"}
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={handleExportXML}
            disabled={
              !selectedHsbaForDetail?.NoiDungXml ||
              selectedHsbaForDetail?.TrangThaiKetXuat?.toString() !== "1"
            }
            title={
              selectedHsbaForDetail?.TrangThaiKetXuat?.toString() !== "1"
                ? "Hồ sơ chưa được kết xuất"
                : "Xuất file XML"
            }>
            Xuất XML
          </Button>

          {/* Thông báo trạng thái */}
          {selectedHsbaForDetail?.TrangThaiKetXuat?.toString() !== "1" && (
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "warning.main",
                fontStyle: "italic",
                ml: 2,
              }}>
              ⚠️ Hồ sơ chưa được kết xuất
            </Typography>
          )}
        </Box>

        {/* Vùng 2: Lưới chi tiết và PDF viewer - FIX LAYOUT */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            height: "100%",
          }}>
          {/* Vùng trái: Lưới chi tiết phiếu */}
          <Box
            sx={{
              width: 400, // Fixed width cho DataGrid
              height: "100%",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0, // Không cho phép shrink
            }}>
            <Typography
              variant="subtitle2"
              sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
              Danh sách phiếu
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: "100%",
                width: "100%",
              }}>
              <DataGrid
                rows={phieuList}
                columns={phieuColumns}
                density="compact"
                onRowClick={handlePhieuRowClick}
                hideFooter
                sx={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f8f9fa",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Vùng phải: Hiển thị PDF */}
          <Box
            sx={{
              borderLeft: "1px solid #e0e0e0",
              height: "100%",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              minWidth: 0,
            }}>
            <Typography
              variant="subtitle2"
              sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
              Xem trước PDF
            </Typography>
            {pdfUrl ? (
              <Box
                sx={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  "& object": {
                    width: "100%",
                    height: "100%",
                  },
                }}>
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  style={{ border: "none", width: "100%", height: "100%" }}>
                  <p>
                    Không thể hiển thị PDF.{" "}
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Mở trong tab mới
                    </a>
                  </p>
                </object>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  backgroundColor: "#f5f5f5",
                }}>
                <Typography variant="h6" color="text.secondary">
                  Chọn một phiếu để xem chi tiết PDF
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DialogDetail);
