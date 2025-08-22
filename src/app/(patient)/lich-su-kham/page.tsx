"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastError, ToastSuccess } from "@/lib/toast";
import { genOTP, sentOTP } from "@/utils/otp";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpError, setOtpError] = useState(false);

  const otpValue = useRef(""); // giữ giá trị OTP

  // check login nếu có token
  useEffect(() => {
    const token = localStorage.getItem("token-patient");
    console.log('Token ==== ', token)

    // if (token) {
    //   router.push("/"); // đã login → redirect
    // }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleMobile = async () => {
    if (cooldown > 0) return;

    setSendingOTP(true);
    try {
      const otp = genOTP();
      otpValue.current = otp; // giữ lại để so sánh
      await sentOTP(phone, otp);

      setForm("otp");
      setCooldown(30);
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

    console.log('otpValue.current === ', otpValue.current)

    if (otp !== otpValue.current) {
      setOtpError(true);
      return;
    }

    try {
      // demo: tạo token giả (bạn có thể thay bằng JWT thật)
      const fakeToken = btoa(JSON.stringify({ phone, logged: true, loginAt: Date.now() }));
      localStorage.setItem("token-patient", fakeToken);

      ToastSuccess("Đăng nhập thành công");
      router.push("/");
    } catch (ex) {
      console.error("ex handleLogin", ex);
      ToastError("Đăng nhập không thành công");
    } 
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex gap-x-2 justify-center">
          <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground border border-gray-400 rounded-xs">
            <Image src={"/imgs/logo.png"} width={36} height={36} alt="Logo" />
          </div>
          <div className="grid text-left text-sm leading-tight">
            <span className="truncate text-[10px]">BỆNH VIỆN ĐA KHOA</span>
            <span className="truncate text-base font-semibold">LÊ NGỌC TÙNG</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập số điện thoại → Nhận mã OTP → Nhập OTP để đăng nhập
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form === "phone" && (
              <form onSubmit={(e) => e.preventDefault()} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Số điện thoại</Label>
                  <Input
                    id="mobile"
                    type="text"
                    placeholder="Ví dụ: 0911.xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full"
                  onClick={handleMobile}
                  disabled={cooldown > 0 || sendingOTP}
                >
                  {cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : "Nhận mã OTP"}
                </Button>
              </form>
            )}

            {form === "otp" && (
              <form onSubmit={(e) => e.preventDefault()} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Mã OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={otpError ? "border-red-500" : ""}
                  />
                  {otpError && (
                    <span className="text-red-500 text-sm">Mã OTP không đúng</span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  onClick={handleLogin}
                >
                  Đăng nhập
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  className="w-full"
                  onClick={handleMobile}
                  disabled={cooldown > 0 || sendingOTP}
                >
                  {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
