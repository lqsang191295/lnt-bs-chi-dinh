"use client";
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from "react";
import PolicyDialog from "./PolicyDialog"; // Import component mới

export default function CardAlert() {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Card variant="outlined" sx={{ m: 1.5, flexShrink: 0 }}>
        <CardContent>
          <AutoAwesomeRoundedIcon fontSize="small" />
          <Typography gutterBottom sx={{ fontWeight: 600 }}>
            Chính sách bảo vệ dữ liệu cá nhân
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Hệ thống quản lý hồ sơ bệnh án điện tử một cách hiệu quả và bảo mật.
          </Typography>
          <Button 
            startIcon={<InfoOutlinedIcon />} 
            variant="contained" 
            size="small" 
            fullWidth
            onClick={handleOpenDialog}
          >
            Tìm hiểu thêm
          </Button>
        </CardContent>
      </Card>

      {/* Sử dụng component PolicyDialog */}
      <PolicyDialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
      />
    </>
  );
}