"use client";
import { login,  verifyOTP, sendOTP} from "@/actions/act_tnguoidung";
import { FacebookIcon, GoogleIcon } from "@/components/CustomIcons";
import Spinner from "@/components/spinner";
import { useUserStore } from "@/store/user";
import { TokenClaims } from "@/model/ttokenclaims";
import { getClaimsFromToken, sha256 } from "@/utils/auth";
import { ToastError, ToastSuccess, ToastWarning } from "@/utils/toast"; 
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignIn() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  // OTP states
  const [showOtpDialog, setShowOtpDialog] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState("");
  const [countdown, setCountdown] = React.useState(0);
  const [userInfo, setUserInfo] = React.useState<TokenClaims>(null); // Thông tin user từ token
  const [currentOtp, setCurrentOtp] = React.useState(""); // OTP hiện tại được tạo
  const [canResendOtp, setCanResendOtp] = React.useState(false);
  
  const router = useRouter();
  const { setUserData } = useUserStore();

  // Countdown timer cho resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit");
    event.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const hashedPassword = await sha256(password);
      console.log("handleSubmit ---- ", username, password);

      const res = await login(username, hashedPassword);
      console.log("handleSubmit res ---- ", res);

      if (res && res.status === "success") {
        // Parse thông tin user từ token
        const tokenClaims = parseTokenClaims(res.token);
        console.log("Token claims:", tokenClaims);
        
        // Kiểm tra xem có yêu cầu OTP không (cxacthuc2lop === "1")
        if (tokenClaims?.cxacthuc2lop === "1") {
          setUserInfo(tokenClaims);
          
          // Gửi OTP
          try {

            const otpResult = await sendOTP(tokenClaims.cdienthoai);
            if (otpResult && otpResult.status === "success") {
              setCurrentOtp(otpResult.otp); // Lưu OTP để verify
              setShowOtpDialog(true);
              setCountdown(60); // 60 giây countdown
              setCanResendOtp(false);
              ToastSuccess(`Mã OTP đã được gửi đến số điện thoại ${maskPhoneNumber(tokenClaims.cdienthoai)}`);
            } else {
              ToastError("Không thể gửi mã OTP. Vui lòng thử lại.");
            }
          } catch (otpError) {
            console.error("Error sending OTP:", otpError);
            ToastError("Lỗi khi gửi mã OTP. Vui lòng thử lại.");
          }
        } else {
          // Không cần OTP, đăng nhập thành công
          await completeLogin(res.token);
        }
      } else {
        setError(
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu."
        );
        ToastError("Đăng nhập thất bại");
      }
    } catch (error) {
      console.log("error ", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      ToastError("Đăng nhập thất bại");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      // So sánh OTP nhập vào với OTP đã gửi
      if (otpCode === currentOtp) {
        setShowOtpDialog(false);
        // Tạo token mới với thời gian hết hạn dài hơn
        const finalToken = await generateFinalToken(userInfo);
        await completeLogin(finalToken);
      } else {
        setOtpError("Mã OTP không đúng. Vui lòng thử lại.");
        ToastError("Mã OTP không đúng");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.");
      ToastError("Lỗi xác thực OTP");
    }
    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    if (!canResendOtp || !userInfo?.cdienthoai) return;

    setOtpLoading(true);
    try {
      const otpResult = await sendOTP(userInfo.cdienthoai);
      if (otpResult && otpResult.status === "success") {
        setCurrentOtp(otpResult.otp); // Cập nhật OTP mới
        setCountdown(60);
        setCanResendOtp(false);
        setOtpError("");
        setOtpCode(""); // Reset input
        ToastSuccess("Mã OTP mới đã được gửi");
      } else {
        ToastError("Không thể gửi lại mã OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      ToastError("Lỗi khi gửi lại mã OTP");
    }
    setOtpLoading(false);
  };

  const completeLogin = async (token: string) => {
    // Lưu token và hoàn tất đăng nhập
    Cookies.set("authToken", token, { expires: 7 });
    router.push("/");
    ToastSuccess("Đăng nhập thành công");
    await initUserData();
  };

  const handleCloseOtpDialog = () => {
    setShowOtpDialog(false);
    setOtpCode("");
    setOtpError("");
    setUserInfo(null);
    setCurrentOtp("");
    setCountdown(0);
    setCanResendOtp(false);
  };

  const initUserData = async () => {
    const claims = getClaimsFromToken();
    console.log("Claims fetched:", claims);
    if (claims) {
      setUserData(claims);
    } else {
      console.warn("No valid claims found in token");
    }
  };

  // Parse thông tin từ JWT token
  const parseTokenClaims = (token: string) => {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  };

  // Tạo token cuối cùng sau khi xác thực OTP
  const generateFinalToken = async (userInfo: any) => {
    // Gọi API để tạo token mới với thời gian hết hạn dài hơn
    // Hoặc sử dụng token hiện tại nếu API không hỗ trợ
    try {
      const res = await login(username, await sha256(password));
      return res.token;
    } catch (error) {
      console.error("Error generating final token:", error);
      throw error;
    }
  };

  // Ẩn số điện thoại
  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    return phone.substring(0, 3) + "****" + phone.substring(phone.length - 3);
  };

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Đăng nhập
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}>
            <FormControl>
              <FormLabel htmlFor="username">Tên đăng nhập</FormLabel>
              <TextField
                id="username"
                name="username"
                placeholder="Tên đăng nhập"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Mật khẩu</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Ghi nhớ đăng nhập"
            />
            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="gap-2"
              sx={{ fontWeight: "bold" }}>
              {loading && <Spinner />}
              <span>Đăng nhập</span>
            </Button>
            <Link
              component="button"
              type="button"
              variant="body2"
              sx={{ alignSelf: "center" }}>
              Quên mật khẩu?
            </Link>
          </Box>
          <Divider>hoặc</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Google")}
              startIcon={<GoogleIcon />}>
              Đăng nhập với Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Facebook")}
              startIcon={<FacebookIcon />}>
              Đăng nhập với Facebook
            </Button>
          </Box>
        </Card>
      </SignInContainer>

      {/* OTP Dialog */}
      <Dialog 
        open={showOtpDialog} 
        onClose={handleCloseOtpDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <SecurityIcon color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold" color="primary">
              Xác thực OTP
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseOtpDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', px: 3 }}>
          <Typography variant="body1" color="textSecondary" mb={2}>
            Mã OTP đã được gửi đến số điện thoại:
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
            {userInfo?.cdienthoai ? maskPhoneNumber(userInfo.cdienthoai) : ''}
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Vui lòng nhập mã OTP 6 chữ số để hoàn tất đăng nhập
          </Typography>
          
          <TextField
            fullWidth
            label="Mã OTP"
            placeholder="Nhập 6 chữ số"
            value={otpCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setOtpCode(value);
                setOtpError('');
              }
            }}
            inputProps={{
              maxLength: 6,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem',
                letterSpacing: '0.5rem'
              }
            }}
            error={!!otpError}
            helperText={otpError}
            sx={{ mb: 3 }}
          />

          {countdown > 0 ? (
            <Typography variant="body2" color="textSecondary">
              Gửi lại mã sau: <strong>{formatTime(countdown)}</strong>
            </Typography>
          ) : (
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleResendOtp}
              disabled={otpLoading || !canResendOtp}
              variant="text"
              sx={{ textTransform: 'none' }}
            >
              Gửi lại mã OTP
            </Button>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseOtpDialog} 
            disabled={otpLoading}
            sx={{ minWidth: 100 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleOtpSubmit}
            variant="contained"
            disabled={otpLoading || otpCode.length !== 6}
            sx={{ minWidth: 100, gap: 1 }}
          >
            {otpLoading && <Spinner />}
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}