"use client";
import { Stack } from "@mui/material";
import Image from "next/image";

export default function SelectContent() {
  return (
    <div className="flex items-center gap-4">
      <Image src="/logo.png" alt="Logo" width={32} height={32} />
      <Stack spacing={1}>
        <span className="font-bold text-xs">
          BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG
        </span>
        <span className="text-xs text-gray-500">Hệ thống bệnh án điện tử</span>
      </Stack>
    </div>
  );
}
