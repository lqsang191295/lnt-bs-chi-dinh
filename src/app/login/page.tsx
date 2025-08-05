"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation"; 
import { login } from "@/actions/emr_tnguoidung";
import { sha256 } from "@/utils/auth"; 
import {
  GoogleIcon,
  FacebookIcon,
  SitemarkIcon,
} from "@/components/CustomIcons"; 
import Cookies from "js-cookie";

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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { 
        const hashedPassword = await sha256(password);
        const res = await login(username, hashedPassword);
        //console.log("hashpass:", hashedPassword);
        if (res && res.status === "success") {
        // Lưu token nếu cần
        Cookies.set("authToken", res.token, {expires: 7}); // Lưu token trong cookie với thời gian hết hạn 1 giờ
        //console.log("Login successful, token:", res.token);
        router.push("/");
        } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.");
        }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <SitemarkIcon />
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
              onChange={e => setUsername(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
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
            sx={{ fontWeight: "bold" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
  );
}