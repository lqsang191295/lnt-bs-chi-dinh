// src/app/muon-tra-hsba/components/ds-muon-hsba.tsx
"use client";

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
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import React, { memo, useEffect, useState } from "react";

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
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const createPdfBlobUrl = (base64Data: string): string => {
    try {
      const cleanBase64 = base64Data.replace(
        /^data:application\/pdf;base64,/,
        ""
      );

      // Chuyển đổi base64 thành binary
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Tạo Blob
      const blob = new Blob([bytes], { type: "application/pdf" });

      // Tạo Blob URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating PDF blob:", error);
      return "";
    }
  };
  // Hàm xử lý khi click vào một phiếu trong lưới chi tiết
  const handlePhieuRowClick = (params: GridRowParams) => {
    const base64Data = params.row.FilePdfKySo;
    if (base64Data) {
      const blobUrl = createPdfBlobUrl(base64Data);
      setPdfUrl(blobUrl);
    } else {
      setPdfUrl("");
    }
  };
  // Hàm đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setPdfUrl("");
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!phieuList || phieuList.length === 0) {
      setPdfUrl("");
      return;
    }

    const base64Data = phieuList[0].FilePdfKySo;
    if (base64Data) {
      const blobUrl = createPdfBlobUrl(base64Data);
      setPdfUrl(blobUrl);
    } else {
      setPdfUrl("");
    }
  }, [phieuList]);

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
          <Button variant="contained" startIcon={<PrintIcon />}>
            In HSBA
          </Button>
          <Button variant="contained" startIcon={<DescriptionIcon />}>
            Xuất XML
          </Button>
        </Box>

        {/* Vùng 2: Lưới chi tiết và PDF viewer */}
        <Grid container sx={{ flex: 1, overflow: "hidden" }}>
          {/* Vùng trái: Lưới chi tiết phiếu */}
          <Grid
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, height: "100%" }}>
              <DataGrid
                rows={phieuList}
                columns={phieuColumns}
                density="compact"
                onRowClick={handlePhieuRowClick}
                hideFooter
              />
            </Box>
          </Grid>

          {/* Vùng phải: Hiển thị PDF */}
          <Grid
            sx={{
              borderLeft: "1px solid #e0e0e0",
              height: "100%",
              display: "flex",
              flex: 1,
            }}>
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
                  {/* <iframe
                      src={pdfUrl}
                      style={{ 
                        border: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                      title="PDF Viewer"
                    /> */}
                </object>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  backgroundColor: "#f5f5f5",
                }}>
                <Typography variant="h6" color="text.secondary">
                  Chọn một phiếu để xem chi tiết PDF
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DialogDetail);
