"use client";

import { getPatientBySoDienThoai } from "@/actions/act_patient";
import { sendOTP } from "@/actions/act_tnguoidung";
import { IPatientInfo } from "@/model/tpatient";
import { ToastError, ToastSuccess } from "@/utils/toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LichSuKhamPage() {
  const router = useRouter();

  const [form, setForm] = useState<"phone" | "otp" | "choose-patient">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [dataPatient, setDataPatient] = useState<IPatientInfo[] | null>(null);
  const otpValue = useRef(""); // giữ giá trị OTP
  const searchParams = useSearchParams();
  const mabn = searchParams?.get("mabn");

  useEffect(() => {
    if (!mabn || mabn == "null") {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("token-patient");

    if (!token) {
      setIsChecking(false);
      return;
    }

    if (token) {
      return router.push(`/lich-su-kham/${mabn}`); // đã login → redirect
    }
  }, [mabn, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleMobile = async () => {
    if (cooldown > 0 || sendingOTP) return;

    setSendingOTP(true);
    try {
      const otpResult = await sendOTP(phone);
      otpValue.current = otpResult.otp;
      setForm("otp");
      setCooldown(60);
      ToastSuccess("Gửi OTP thành công");
    } catch (err) {
      console.error("Gửi OTP thất bại", err);
      ToastError("Gửi OTP không thành công");
    } finally {
      setSendingOTP(false);
    }
  };

  const handleLogin = async () => {
    setOtpError(false);

    console.log("otpValue.current === ", otpValue.current);

    if (otp !== otpValue.current) {
      setOtpError(true);
      return;
    }

    try {
      // demo: tạo token giả (bạn có thể thay bằng JWT thật)
      const fakeToken = btoa(
        JSON.stringify({ phone, logged: true, loginAt: Date.now(), mabn })
      );
      localStorage.setItem("token-patient", fakeToken);

      const dataPatientByPhone = await getPatientBySoDienThoai(phone);

      ToastSuccess("Đăng nhập thành công");

      if (
        !mabn &&
        mabn != "null" &&
        dataPatientByPhone &&
        dataPatientByPhone.length > 1
      ) {
        setDataPatient(dataPatientByPhone);
        setForm("choose-patient");

        return;
      }

      router.push(`/lich-su-kham/${mabn}`);
    } catch (ex) {
      console.error("ex handleLogin", ex);
      ToastError("Đăng nhập không thành công");
    }
  };

  if (isChecking) return null;

  return (
    <Box
      className="w-full"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
      }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          width: "100%",
          maxWidth: 400,
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid",
              borderColor: (theme) => theme.palette.grey[400],
              borderRadius: "4px",
              flexShrink: 0,
            }}>
            <Image src={"/logo.png"} width={36} height={36} alt="Logo" />
          </Box>
          <Box
            sx={{
              display: "grid",
              textAlign: "left",
              lineHeight: "tight",
            }}>
            <Typography
              variant="caption"
              sx={{ lineHeight: 1, whiteSpace: "nowrap" }}>
              BỆNH VIỆN ĐA KHOA
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ lineHeight: 1, whiteSpace: "nowrap" }}>
              LÊ NGỌC TÙNG
            </Typography>
          </Box>
        </Box>

        <Card sx={{ width: "100%", maxWidth: 400, borderRadius: 2 }}>
          <CardHeader
            title="Xem lịch sử khám"
            subheader="Nhập số điện thoại → Nhận mã OTP → Nhập OTP để đăng nhập"
            className="text-center"
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ pt: 2 }}>
            {form === "phone" && (
              <Box
                component="form"
                sx={{ display: "grid", gap: 3 }}
                onSubmit={(e) => e.preventDefault()}
                noValidate
                autoComplete="off">
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography
                    variant="body2"
                    component="label"
                    htmlFor="mobile">
                    Số điện thoại
                  </Typography>
                  <TextField
                    id="mobile"
                    fullWidth
                    type="text"
                    placeholder="Ví dụ: 0911.xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  onClick={handleMobile}
                  disabled={cooldown > 0 || sendingOTP}
                  sx={{ py: 1.5 }}>
                  {sendingOTP ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : cooldown > 0 ? (
                    `Vui lòng đợi ${cooldown}s`
                  ) : (
                    "Nhận mã OTP"
                  )}
                </Button>
              </Box>
            )}

            {form === "otp" && (
              <Box
                component="form"
                sx={{ display: "grid", gap: 3 }}
                onSubmit={(e) => e.preventDefault()}
                noValidate
                autoComplete="off">
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography variant="body2" component="label" htmlFor="otp">
                    Mã OTP
                  </Typography>
                  <TextField
                    id="otp"
                    fullWidth
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={otpError}
                    helperText={otpError ? "Mã OTP không đúng" : ""}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  onClick={handleLogin}
                  sx={{ py: 1.5 }}>
                  Đăng nhập
                </Button>

                <Button
                  type="button"
                  variant="text"
                  fullWidth
                  onClick={handleMobile}
                  disabled={cooldown > 0 || sendingOTP}
                  sx={{ py: 1.5 }}>
                  {sendingOTP ? (
                    <CircularProgress size={24} />
                  ) : cooldown > 0 ? (
                    `Gửi lại sau ${cooldown}s`
                  ) : (
                    "Gửi lại mã OTP"
                  )}
                </Button>
              </Box>
            )}

            {form === "choose-patient" && (
              <Box className="flex flex-col gap-1">
                {dataPatient?.map((item: IPatientInfo) => (
                  <Box
                    key={item.Ma}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/lich-su-kham/${item.Ma}`)}>
                    <Typography
                      variant="body2"
                      component="label"
                      htmlFor="mobile">
                      {item.Hoten}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
