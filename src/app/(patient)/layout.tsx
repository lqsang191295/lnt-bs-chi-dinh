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
      <HeadMetadata title="Lịch sử khám" />
      <Box className="flex h-full w-full bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_50%,#bbf7d0_100%)]">
        {children}
      </Box>
      <Toaster />
    </>
  );
}
