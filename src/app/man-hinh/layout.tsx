import type React from "react"
import type { Metadata } from "next"
import  {ThemeRegistry}  from "@/components/ThemeRegistry"
import "./globals.css"

export const metadata: Metadata = {
  title: "Màn hình chờ đăng ký khám bệnh",
  description: "Màn hình hiển thị số thứ tự bệnh viện",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
