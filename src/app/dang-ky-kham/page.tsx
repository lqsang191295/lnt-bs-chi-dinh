"use client"

import { useState } from "react"
import Grid from "@mui/material/Grid";
import { keyframes } from "@emotion/react"

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Paper,
  Chip,
  Container,
  CircularProgress,
  InputAdornment,
  ThemeProvider,
  createTheme,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@mui/material"
import {
  ArrowBack,
  Camera,
  CreditCard,
  Badge as IdCard,
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  AccessTime,
  Favorite,
  CheckCircle,
  Print,
  QueueMusic,
  Male,
  Female
} from "@mui/icons-material"
const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // blue-600
      light: "#3b82f6", // blue-500
    },
    secondary: {
      main: "#059669", // green-600
      light: "#10b981", // green-500
    },
    background: {
      default: "#f8fafc",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          fontSize: "1.1rem",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
})

// animation: pulse cho các icon / loader và scanLine cho vệt quét
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`

const scanLine = keyframes`
  0% { transform: translateY(-110%); opacity: 0; }
  10% { opacity: 0.3; }
  50% { transform: translateY(50%); opacity: 0.9; }
  90% { opacity: 0.3; }
  100% { transform: translateY(110%); opacity: 0; }
`

type RegistrationStep = "home" | "bhyt" | "service" | "form" | "camera" | "success"

interface PatientInfo {
  name: string
  phone: string
  address: string
  birthDate: string
  gender?: string
  idNumber: string
  insuranceNumber?: string
  queueNumber?: string
  registrationTime?: string
}

export default function HospitalKiosk() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("home")
  const [registrationType, setRegistrationType] = useState<"bhyt" | "service">("bhyt")
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    phone: "",
    address: "",
    birthDate: "",
    idNumber: "",
    insuranceNumber: "",
  })
  const [isScanning, setIsScanning] = useState(false)

  const handleRegistrationChoice = (type: "bhyt" | "service") => {
    setRegistrationType(type)
    setCurrentStep(type)
  }

  const handleScanComplete = () => {
    // Simulate scanning and auto-fill data
    setIsScanning(true)
    if (registrationType === "bhyt") {
      setPatientInfo({
        name: "Nguyễn Văn An",
        phone: "0123456789",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        birthDate: "15/03/1985",
        idNumber: "123456789012",
        insuranceNumber: "DN1234567890123",
      })
    } else {
      setPatientInfo({
        name: "Trần Thị Bình",
        phone: "0987654321",
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        birthDate: "22/07/1990",
        idNumber: "987654321098",
        insuranceNumber: "",
      })
    }
    setCurrentStep("form")
  }

  const handleFormSubmit = () => {
    setCurrentStep("camera")
  }

  const generateQueueNumber = () => {
    const prefix = registrationType === "bhyt" ? "BH" : "DV"
    const number = Math.floor(Math.random() * 999) + 1
    return `${prefix}${number.toString().padStart(3, "0")}`
  }

  const handlePrint = () => {
    const printContent = `
      BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG
      =====================================
      
      PHIẾU ĐĂNG KÝ KHÁM BỆNH
      
      Số thứ tự: ${patientInfo.queueNumber}
      Loại đăng ký: ${registrationType === "bhyt" ? "Bảo hiểm y tế" : "Dịch vụ"}
      
      THÔNG TIN BỆNH NHÂN:
      - Họ tên: ${patientInfo.name}
      - Số điện thoại: ${patientInfo.phone}
      - Ngày sinh: ${patientInfo.birthDate}
      - Số CMND/CCCD: ${patientInfo.idNumber}
      ${registrationType === "bhyt" ? `- Số thẻ BHYT: ${patientInfo.insuranceNumber}` : ""}
      - Địa chỉ: ${patientInfo.address}
      
      Thời gian đăng ký: ${patientInfo.registrationTime}
      
      Vui lòng đến quầy lễ tân để hoàn tất thủ tục.
      
      =====================================
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Phiếu đăng ký khám bệnh</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleFaceVerification = () => {
    // Simulate face verification
    setTimeout(() => {
      const queueNumber = generateQueueNumber()
      const registrationTime = new Date().toLocaleString("vi-VN")

      setPatientInfo((prev) => ({
        ...prev,
        queueNumber,
        registrationTime,
      }))

      setCurrentStep("success")
    }, 3000)
  }

  const resetKiosk = () => {
    setCurrentStep("home")
    setPatientInfo({
      name: "",
      phone: "",
      address: "",
      birthDate: "",
      idNumber: "",
      insuranceNumber: "",
      queueNumber: "",
      registrationTime: "",
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)",
          p: 4,
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={3}
            sx={{
              textAlign: "center",
              mb: 4,
              p: 4,
              borderRadius: 4,
              borderTop: "6px solid",
              borderTopColor: "primary.main",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <Box
                component="img"
                src="/banner_cls.png"
                alt="Logo bệnh viện"
                sx= {{ width: "100%", objectFit: "contain" }}
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                height: 4,
                background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)",
                borderRadius: 2,
              }}
            />
          </Paper>

          {/* Back Button */}
          {currentStep !== "home" && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => (currentStep === "success" ? resetKiosk() : setCurrentStep("home"))}
              sx={{
                mb: 3,
                height: 56,
                px: 3,
                fontSize: "1.1rem",
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              {currentStep === "success" ? "Đăng ký mới" : "Quay lại"}
            </Button>
          )}

          {currentStep === "home" && (
            <Grid container spacing={4}>
              <Grid size={6}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: 2,
                    borderColor: "transparent",
                    height: "100%",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "scale(1.02)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleRegistrationChoice("bhyt")}
                >
                  <CardContent
                    sx={{ textAlign: "center", p: 4, height: "100%", display: "flex", flexDirection: "column" }}
                  >
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        mx: "auto",
                        mb: 3,
                        bgcolor: "primary.light",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.3,
                      }}
                    >
                    <CreditCard sx={{ fontSize: 48, color: "black", fontWeight: "bold"  }} />
                    </Box>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", color: "primary.main", mb: 2 }}>
                      Đăng ký khám BHYT
                    </Typography>
                    <Typography variant="h6" sx={{ color: "text.secondary", mb: 4, flexGrow: 1 }}>
                      Sử dụng thẻ bảo hiểm y tế để đăng ký khám bệnh
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        height: 64,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        mt: "auto",
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegistrationChoice("bhyt")
                      }}
                    >
                      Chọn đăng ký BHYT
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={6}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: 2,
                    borderColor: "transparent",
                    height: "100%",
                    "&:hover": {
                      borderColor: "secondary.main",
                      transform: "scale(1.02)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleRegistrationChoice("service")}
                >
                  <CardContent
                    sx={{ textAlign: "center", p: 4, height: "100%", display: "flex", flexDirection: "column" }}
                  >
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        mx: "auto",
                        mb: 3,
                        bgcolor: "secondary.light",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.3,
                      }}
                    >
                      <IdCard sx={{ fontSize: 48, color: "black" }} />
                    </Box>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", color: "secondary.main", mb: 2 }}>
                      Đăng ký khám dịch vụ
                    </Typography>
                    <Typography variant="h6" sx={{ color: "text.secondary", mb: 4, flexGrow: 1 }}>
                      Sử dụng căn cước công dân để đăng ký khám dịch vụ
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      sx={{
                        height: 64,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        mt: "auto",
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegistrationChoice("service")
                      }}
                    >
                      Chọn đăng ký dịch vụ
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {(currentStep === "bhyt" || currentStep === "service") && (
            <Card sx={{ maxWidth: 800, mx: "auto" }}>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h3" component="h2" sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}>
                  {registrationType === "bhyt" ? "Quét thẻ BHYT" : "Quét căn cước công dân"}
                </Typography>
                <Typography variant="h6" sx={{ color: "text.secondary", mb: 4 }}>
                  {registrationType === "bhyt"
                    ? "Vui lòng đặt thẻ bảo hiểm y tế vào vùng quét bên dưới"
                    : "Vui lòng đặt căn cước công dân vào vùng quét bên dưới"}
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    position: "relative", // để overlay absolute hoạt động
                     width: 320,
                     height: 192,
                     mx: "auto",
                     mb: 4,
                     border: "4px dashed",
                     borderColor: "primary.light",
                     borderRadius: 2,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     bgcolor: "primary.light",
                     opacity: 0.1,
                    overflow: "hidden",
                   }}
                >
                  {isScanning ? (
                    <>
                      {/* overlay vệt quét */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          bottom: 0,
                          zIndex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: "-10%",
                            right: "-10%",
                            height: "20%",
                            background:
                              "linear-gradient(90deg, rgba(37,99,235,0.0) 0%, rgba(37,99,235,0.25) 30%, rgba(5,150,105,0.35) 60%, rgba(37,99,235,0.0) 100%)",
                            filter: "blur(8px)",
                            transform: "translateY(-110%)",
                            animation: `${scanLine} 1.6s linear infinite`,
                          }}
                        />
                      </Box>

                      <Box sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                        <CircularProgress
                          size={48}
                          sx={{
                            mb: 2,
                            color: "secondary.main",
                            animation: `${pulse} 1.5s ease-in-out infinite`,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "secondary.main" }}>
                          Đang quét...
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      {registrationType === "bhyt" ? (
                        <CreditCard sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
                      ) : (
                        <IdCard sx={{ fontSize: 64, color: "secondary.main", mb: 2 }} />
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.secondary" }}>
                        Đặt {registrationType === "bhyt" ? "thẻ BHYT" : "căn cước"} vào đây
                      </Typography>
                    </Box>
                  )}
                 </Paper>

                <Button
                  variant="contained"
                  size="large"
                  color={registrationType === "bhyt" ? "primary" : "secondary"}
                  sx={{
                    height: 64,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    px: 6,
                  }}
                  onClick={() => {
                    setIsScanning(true)
                    setTimeout(handleScanComplete, 2000)
                  }}
                  disabled={isScanning}
                >
                  {isScanning ? "Đang quét..." : "Bắt đầu quét"}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "form" && (
            <Card sx={{ maxWidth: 1000, mx: "auto" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ fontWeight: "bold", textAlign: "center", mb: 1, color: "primary.main" }}
                >
                  Xác nhận thông tin
                </Typography>
                <Typography variant="h6" sx={{ textAlign: "center", color: "text.secondary", mb: 4 }}>
                  Vui lòng kiểm tra và bổ sung thông tin cần thiết
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                            sx: { height: 56, fontSize: "1.1rem" },
                          },
                          inputLabel: {
                            sx: { fontSize: "1.1rem", fontWeight: 600 },
                          },
                        }}
                      />
                  </Grid>
                   <Grid size={6} mt={-1}>
                    <FormControl
                    fullWidth
                      component="fieldset"
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: 2,
                      }}
                    >
                      <FormLabel
                        component="legend"
                        sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        Giới tính
                      </FormLabel>
                      <RadioGroup
                        row
                        value={patientInfo.gender}
                        onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                      >
                        <FormControlLabel
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Male sx={{ color: "#2563eb" }} /> Nam
                            </Box>
                          }
                          value="male"
                          control={<Radio sx={{ color: "#9333ea", pl:2 }} />}
                        />
                        <FormControlLabel
                          value="female"
                          control={<Radio sx={{ color: "#9333ea" }} />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Female sx={{ color: "#2563eb" }} /> Nữ
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      placeholder="DD/MM/YYYY"
                      value={patientInfo.birthDate}
                      onChange={(e) => setPatientInfo({ ...patientInfo, birthDate: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday sx={{ color: "#9333ea" }} />
                              </InputAdornment>
                            ),
                            sx: { height: 56, fontSize: "1.1rem" },
                          },
                          inputLabel: {
                            sx: { fontSize: "1.1rem", fontWeight: 600 },
                          },
                        }}
                      />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="secondary" />
                              </InputAdornment>
                            ),
                            sx: { height: 56, fontSize: "1.1rem" },
                          },
                          inputLabel: {
                            sx: { fontSize: "1.1rem", fontWeight: 600 },
                          },
                        }}
                      />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label={registrationType === "bhyt" ? "Số CMND/CCCD" : "Số căn cước"}
                      value={patientInfo.idNumber}
                      onChange={(e) => setPatientInfo({ ...patientInfo, idNumber: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <IdCard sx={{ color: "#ea580c" }} />
                              </InputAdornment>
                            ),
                            sx: { height: 56, fontSize: "1.1rem" },
                          },
                          inputLabel: {
                            sx: { fontSize: "1.1rem", fontWeight: 600 },
                          },
                        }}
                      />
                  </Grid>

                  {registrationType === "bhyt" && (
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        label="Số thẻ BHYT"
                        value={patientInfo.insuranceNumber}
                        onChange={(e) => setPatientInfo({ ...patientInfo, insuranceNumber: e.target.value })}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCard color="primary" />
                                </InputAdornment>
                              ),
                              sx: { height: 56, fontSize: "1.1rem" },
                            },
                            inputLabel: {
                              sx: { fontSize: "1.1rem", fontWeight: 600 },
                            },
                          }}
                        />
                    </Grid>
                  )}

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={patientInfo.address}
                      onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn sx={{ color: "#dc2626" }} />
                              </InputAdornment>
                            ),
                            sx: { height: 56, fontSize: "1.1rem" },
                          },
                          inputLabel: {
                            sx: { fontSize: "1.1rem", fontWeight: 600 },
                          },
                        }}
                      />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      height: 64,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      px: 6,
                      background: "linear-gradient(45deg, #2563eb 30%, #059669 90%)",
                    }}
                    onClick={handleFormSubmit}
                  >
                    Tiếp tục xác thực khuôn mặt
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {currentStep === "camera" && (
            <Card sx={{ maxWidth: 800, mx: "auto" }}>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <Typography variant="h3" component="h2" sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}>
                  Xác thực khuôn mặt
                </Typography>
                <Typography variant="h6" sx={{ color: "text.secondary", mb: 4 }}>
                  Vui lòng nhìn thẳng vào camera để xác thực danh tính
                </Typography>

                <Box
                  sx={{
                    width: 320,
                    height: 320,
                    mx: "auto",
                    mb: 4,
                    border: "4px solid",
                    borderColor: "primary.light",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.light",
                    opacity: 0.1,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 2,
                      border: "2px dashed",
                      borderColor: "primary.main",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <Camera sx={{ fontSize: 80, color: "primary.main" }} />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Chip
                    icon={<AccessTime />}
                    label="Đang xác thực..."
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: "1.1rem", px: 2, py: 1, height: 40 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    height: 64,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    px: 6,
                    background: "linear-gradient(45deg, #2563eb 30%, #059669 90%)",
                  }}
                  onClick={handleFaceVerification}
                >
                  Bắt đầu xác thực
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "success" && (
            <Card sx={{ maxWidth: 900, mx: "auto", textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    mx: "auto",
                    mb: 3,
                    bgcolor: "secondary.light",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "secondary.main",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 24, color: "white" }} />
                  </Box>
                </Box>

                <Typography variant="h3" component="h2" sx={{ fontWeight: "bold", color: "secondary.main", mb: 2 }}>
                  Đăng ký thành công!
                </Typography>

                <Paper
                  sx={{
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                    color: "white",
                    p: 3,
                    borderRadius: 3,
                    mb: 4,
                    boxShadow: 4,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                    <QueueMusic sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      SỐ THỨ TỰ CỦA BẠN
                    </Typography>
                  </Box>
                  <Typography variant="h1" sx={{ fontWeight: "bold", fontSize: "4rem", mb: 1 }}>
                    {patientInfo.queueNumber}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Loại: {registrationType === "bhyt" ? "Bảo hiểm y tế" : "Dịch vụ"}
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "primary.light",
                    mb: 4,
                    textAlign: "left",
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "primary.main", textAlign: "center" }}>
                    THÔNG TIN ĐĂNG KÝ
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Họ tên:</strong> {patientInfo.name}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Số điện thoại:</strong> {patientInfo.phone}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Ngày sinh:</strong> {patientInfo.birthDate}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Số CMND/CCCD:</strong> {patientInfo.idNumber}
                      </Typography>
                      {registrationType === "bhyt" && (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Số thẻ BHYT:</strong> {patientInfo.insuranceNumber}
                        </Typography>
                      )}
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Thời gian:</strong> {patientInfo.registrationTime}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="body1">
                        <strong>Địa chỉ:</strong> {patientInfo.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Print />}
                    sx={{
                      height: 64,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      px: 4,
                      borderWidth: 2,
                      "&:hover": { borderWidth: 2 },
                    }}
                    onClick={handlePrint}
                  >
                    In phiếu đăng ký
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      height: 64,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      px: 4,
                      background: "linear-gradient(45deg, #2563eb 30%, #059669 90%)",
                    }}
                    onClick={resetKiosk}
                  >
                    Đăng ký cho bệnh nhân khác
                  </Button>
                </Box>

                <Typography variant="body1" sx={{ mt: 3, color: "text.secondary", fontStyle: "italic" }}>
                  Vui lòng giữ phiếu đăng ký và đến quầy lễ tân để hoàn tất thủ tục khám bệnh
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
