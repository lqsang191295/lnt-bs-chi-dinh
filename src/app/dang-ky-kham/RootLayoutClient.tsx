"use client"

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material"
import { DM_Sans } from "next/font/google"
import { useMemo } from "react"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

function makeTheme(fontFamily: string) {
  return createTheme({
    typography: {
      fontFamily,
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
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useMemo(() => makeTheme(`"DM Sans", ${dmSans.style.fontFamily}, Arial, sans-serif`), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}