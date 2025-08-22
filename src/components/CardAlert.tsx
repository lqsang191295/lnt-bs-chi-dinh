"use client";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
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
      <Card
        className="border-t-1 border-gray-200 !rounded-none absolute bottom-0"
        sx={{ p: 0, flexShrink: 0 }}>
        <CardContent className="!p-2">
          <Typography gutterBottom sx={{ fontWeight: 600 }}>
            <AdminPanelSettingsOutlinedIcon fontSize="medium" />
            THÔNG BÁO
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            CHẤP THUẬN VỀ VIỆC XỬ LÝ VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN.
          </Typography>
          <Button
            startIcon={<InfoOutlinedIcon />}
            variant="contained"
            size="small"
            fullWidth
            onClick={handleOpenDialog}>
            Tìm hiểu thêm
          </Button>
        </CardContent>
      </Card>

      {/* Sử dụng component PolicyDialog */}
      <PolicyDialog open={openDialog} onClose={handleCloseDialog} />
    </>
  );
}
