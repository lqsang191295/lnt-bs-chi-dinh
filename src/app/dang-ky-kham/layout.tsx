"use client";
import HeadMetadata from "@/components/HeadMetadata";
import { Box } from "@mui/material";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeadMetadata title="Đăng ký khám" />
      <Box className="flex w-screen h-screen">
        <Box className="bg-blue-100 h-full w-full">{children}</Box>
      </Box>
      <Toaster />
    </>
  );
}
