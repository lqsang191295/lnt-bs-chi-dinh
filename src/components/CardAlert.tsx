"use client";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { useState, useEffect } from "react";
import PolicyDialog from "./PolicyDialog";

export default function CardAlert() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Load trạng thái từ localStorage
  useEffect(() => {
    const savedMinimized = localStorage.getItem('cardAlert_minimized');
    const savedVisible = localStorage.getItem('cardAlert_visible');
    
    if (savedMinimized) {
      setIsMinimized(JSON.parse(savedMinimized));
    }
    if (savedVisible !== null) {
      setIsVisible(JSON.parse(savedVisible));
    }
  }, []);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    localStorage.setItem('cardAlert_minimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  useEffect(() => {
    localStorage.setItem('cardAlert_visible', JSON.stringify(isVisible));
  }, [isVisible]);
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  return (
    <>
      <Card
        sx={{ 
          position: 'fixed',
          bottom: 20,
          left: 10,
          width: 300, // Chiều rộng cố định không đổi
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          p: 0, 
          flexShrink: 0,
          border: '1px solid rgba(25, 118, 210, 0.2)',
          backgroundColor: 'background.paper',
          zIndex: 1300,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <CardContent sx={{ 
          p: isMinimized ? 1.5 : 2.5, 
          '&:last-child': { pb: isMinimized ? 1.5 : 2.5 },
          position: 'relative'
        }}>
          {/* Header với nút thu nhỏ ngang hàng */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: isMinimized ? 0 : 8
          }}>
            <Typography 
              sx={{ 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: '0.9rem',
                color: 'primary.main',
                mb: 0
              }}
            >
              <AdminPanelSettingsOutlinedIcon 
                fontSize="small" 
                color="primary" 
              />
              THÔNG BÁO
            </Typography>
            
            <IconButton
              size="small"
              onClick={handleToggleMinimize}
              sx={{
                color: 'primary.main',
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                }
              }}
            >
              {isMinimized ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ExpandLessIcon fontSize="small" />
              )}
            </IconButton>
          </div>

          {/* Nội dung có thể collapse */}
          <Collapse in={!isMinimized} timeout={300}>
            <div>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2.5, 
                  color: "text.secondary",
                  fontSize: '0.8rem',
                  lineHeight: 1.5
                }}
              >
                CHẤP THUẬN VỀ VIỆC XỬ LÝ VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN.
              </Typography>
              
              <Button
                startIcon={<InfoOutlinedIcon />}
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleOpenDialog}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  py: 0.8,
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  }
                }}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </Collapse>

          {/* Button "Chi tiết" khi minimize */}
          {isMinimized && (
            <Button
              startIcon={<InfoOutlinedIcon />}
              variant="text"
              size="small"
              onClick={handleOpenDialog}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                p: 0,
                mt: 0.5,
                minWidth: 'auto',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Chi tiết
            </Button>
          )}
        </CardContent>
      </Card>

      <PolicyDialog open={openDialog} onClose={handleCloseDialog} />
    </>
  );
}