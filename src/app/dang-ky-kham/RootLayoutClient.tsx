"use client"

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const theme = createTheme({
  typography: {
    fontFamily: `"DM Sans", ${dmSans.style.fontFamily}, Arial, sans-serif`,
  },
  palette: {
    primary: {
      main: "#00695c",
    },
    secondary: {
      main: "#ff7043",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
  },
})

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}