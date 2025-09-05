"use client";
import React from 'react';
import { Box, CircularProgress, Typography, Fade, Backdrop } from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  subMessage?: string;
  type?: 'spinner' | 'pulse' | 'dots';
  backdrop?: boolean;
}

export default function LoadingOverlay({ 
  open, 
  message = "Đang xử lý...", 
  subMessage,
  type = 'spinner',
  backdrop = true 
}: LoadingOverlayProps) {
  if (!open) return null;

  const renderLoader = () => {
    switch (type) {
      case 'pulse':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#1976D2',
                  animation: 'pulse 1.4s ease-in-out infinite both',
                  animationDelay: `${i * 0.16}s`,
                  '@keyframes pulse': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0.8)',
                      opacity: 0.5,
                    },
                    '40%': {
                      transform: 'scale(1.2)',
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </Box>
        );
      case 'dots':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#1976D2',
                  animation: 'bounce 1.4s ease-in-out infinite both',
                  animationDelay: `${i * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0)',
                    },
                    '40%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
            ))}
          </Box>
        );
      default:
        return (
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#1976D2',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        );
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minWidth: 300,
        maxWidth: 400,
      }}
    >
      {/* Loading Animation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderLoader()}
      </Box>

      {/* Main Message */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: '#1976D2',
          textAlign: 'center',
          fontSize: '1.2rem',
        }}
      >
        {message}
      </Typography>

      {/* Sub Message */}
      {subMessage && (
        <Typography
          variant="body2"
          sx={{
            color: '#666',
            textAlign: 'center',
            fontSize: '0.9rem',
            lineHeight: 1.4,
          }}
        >
          {subMessage}
        </Typography>
      )}

      {/* Progress Bar Animation */}
      <Box
        sx={{
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1976D2',
            borderRadius: 2,
            animation: 'progress 2s ease-in-out infinite',
            '@keyframes progress': {
              '0%': {
                transform: 'translateX(-100%)',
              },
              '100%': {
                transform: 'translateX(100%)',
              },
            },
          }}
        />
      </Box>
    </Box>
  );

  if (backdrop) {
    return (
      <Backdrop
        open={open}
        sx={{
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Fade in={open} timeout={300}>
          {content}
        </Fade>
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Fade in={open} timeout={300}>
        {content}
      </Fade>
    </Box>
  );
}

// Hook để quản lý loading state
export function useLoading() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('Đang xử lý...');
  const [subMessage, setSubMessage] = React.useState<string | undefined>();

  const showLoading = (msg?: string, subMsg?: string) => {
    setMessage(msg || 'Đang xử lý...');
    setSubMessage(subMsg);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    loadingMsg?: string,
    subMsg?: string
  ): Promise<T> => {
    try {
      showLoading(loadingMsg, subMsg);
      const result = await asyncFn();
      return result;
    } finally {
      hideLoading();
    }
  };

  return {
    loading,
    message,
    subMessage,
    showLoading,
    hideLoading,
    withLoading,
  };
}
