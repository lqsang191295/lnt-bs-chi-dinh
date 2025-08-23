import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import {
  Lock,
  Home,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface AccessDeniedPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackClick?: () => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  title = "BẠN KHÔNG CÓ QUYỀN TRUY CẬP",
  message = "Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.",
  showBackButton = true,
  showHomeButton = true,
  onBackClick,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            maxWidth: 600,
            width: '100%',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
              }}
            >
              <Lock
                sx={{
                  fontSize: 60,
                  color: 'white',
                }}
              />
            </Box>
          </Box>

          {/* Error Code */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '3rem', sm: '4rem' },
              fontWeight: 'bold',
              color: '#f44336',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            403
          </Typography>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 'bold',
              color: '#333',
              mb: 2,
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 4,
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            {message}
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {showBackButton && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBackClick}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                Quay lại
              </Button>
            )}

            {showHomeButton && (
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={handleHomeClick}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  backgroundColor: '#1976d2',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                Trang chủ
              </Button>
            )}
          </Box>

          {/* Additional Info */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontSize: '0.9rem',
              }}
            >
              Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ:{' '}
              <Typography
                component="span"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'medium',
                }}
              >
                admin@hospital.com
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessDeniedPage;