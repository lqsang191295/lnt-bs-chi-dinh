"use client"
import { searchPatientInfoByType, dangKyKhamBenh, CheckBHXHByPatientInfo } from "@/actions/act_dangkykhambenh";
import { PatientInfo, BV_QlyCapThe } from "@/model/dangkykhambenh";
import { createQRScanner } from "@/actions/act_qrscan";
import { useState, useEffect, useRef, useCallback } from "react"
import JsBarcode from "jsbarcode";
import HeaderBVLNT from "@/components/HeaderBVLNT"
import VirtualKeyboard from "@/components/VirtualKeyboard"
import {DateWheelPickerPopup, useDateWheelPicker} from "@/components/date-wheel-picker"
import LoadingOverlay, { useLoading } from "@/components/LoadingOverlay"
import { CURRENT_DATE, DateUtils } from "@/utils/dateUtils"
import { useClickOutside } from "@/utils/useClickOutside"
import "react-simple-keyboard/build/css/index.css";
// Định nghĩa interface cho Speech Recognition API
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  TextFieldProps,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
  Container,
  Paper,
  InputAdornment,
  Dialog, DialogTitle, DialogContent,
  DialogActions,
  IconButton,
  List, ListItemButton, ListItemText, Divider,
} from "@mui/material"
import {
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  LocalHospital,
  HealthAndSafety,
  MedicalServices, Badge as IdCard, EditNote, Error, Warning,CheckCircle,
  AssignmentLate,
  Print, ContactEmergency,
  Mic, Search, Keyboard
} from "@mui/icons-material"
type RegistrationStep = "home" | "bhyt" | "dv" | "form" | "success"
type ExamType = "bhyt" | "dv" | "ksk"
type KeyboardField = "fullname" | "phone" | "address" | "birthDateString" | "idNumber" | "insuranceNumber" | "chiefComplaint"

interface ErrorDialog {
  open: boolean
  title: string
  message: string
  type: "error" | "warning" | "info"
}
// Debounced TextField to reduce frequent parent updates/rendering
function DebouncedTextField(props: TextFieldProps & { debounceMs?: number }) {
  const { value, onChange, debounceMs = 250, ...rest } = props
  const [local, setLocal] = useState<string>(() => (value as string) || "")
  const timerRef = useRef<number | null>(null)
  const prevValueRef = useRef<string>((value as string) || "")
  useEffect(() => {
    // Chỉ update local khi value thực sự thay đổi từ bên ngoài
    const stringValue = (value as string) || ""
    if (stringValue !== prevValueRef.current) {
      setLocal(stringValue)
      prevValueRef.current = stringValue
    }
  }, [value])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    setLocal(v)
    
    // Clear timer cũ
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    
    // Set timer mới
    timerRef.current = window.setTimeout(() => {
      onChange?.(e)
      timerRef.current = null
    }, debounceMs)
  }

  return <TextField {...rest} value={local} onChange={handleLocalChange} />
}
export default function MedicalKioskPage() {
  const datePickerHook = useDateWheelPicker(CURRENT_DATE)
  const datePickerHookRef = useRef(datePickerHook)
  const { loading, message, subMessage, withLoading } = useLoading()
  
  // Cập nhật ref khi datePickerHook thay đổi
  useEffect(() => {
    datePickerHookRef.current = datePickerHook
  }, [datePickerHook])
  const [keyboardMode, setKeyboardMode] = useState<"text" | "numeric">()
  const [focusedField, setFocusedField] = useState<KeyboardField | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardText, setKeyboardText] = useState("");
  const focusedFieldRef = useRef<KeyboardField | null>(null);
  const scannerRef = useRef<ReturnType<typeof createQRScanner> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form")
  const [isConnectPort, setIsConnectPort] = useState(false)
  const [patientSelectOpen, setPatientSelectOpen] = useState(false)
  const [patientCandidates, setPatientCandidates] = useState<BV_QlyCapThe[]>([])
  
  // Click outside refs cho các Dialog
  const patientSelectDialogRef = useClickOutside<HTMLDivElement>(() => {
    if (patientSelectOpen) {
      setPatientSelectOpen(false)
    }
  }, patientSelectOpen)
  
  const showErrorDialog = (title: string, message: string, type: "error" | "warning" | "info" = "error") => {
    setErrorDialog({
      open: true,
      title,
      message,
      type,
    })
  }
  const handleKeyboardTextChange = (text: string) => {
    setKeyboardText(text);
    if (focusedField) {
      setPatientInfo(prev => ({
        ...prev,
        [focusedField]: text
      }));
    }
  };
  const handleCheckBHYT = async () => {
    if (selectedExamType !== "bhyt") return;
    const { fullname, birthDateString, idNumber } = patientInfo;
    if (!fullname || !birthDateString || !idNumber) {
      showErrorDialog(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ Họ tên, Ngày sinh và Số CCCD trước khi kiểm tra.",
        "warning"
      );
      return;
    }
    
    await withLoading(
      async () => {
        // TODO: Gọi API kiểm tra BHXH/BHYT tại đây
        const result = await CheckBHXHByPatientInfo(fullname, idNumber, birthDateString);
        if (result?.maKetQua != "000")
        {
          showErrorDialog("Lỗi", result?.ghiChu || "Vui lòng đến quầy đăng ký để được tư vấn", "warning")
        }
        else if (result?.maKetQua === "000"){
          showErrorDialog("Thông tin", result?.ghiChu, "info" )
          setPatientInfo(prev => ({
            ...prev,
            insuranceNumber: result?.maThe
          }));
        }
      },
      "Đang kiểm tra BHYT",
      "Vui lòng chờ trong giây lát..."
    );
  }



  const handleFieldFocus = (field: KeyboardField) => {
    // setFocusedField(field);
    setKeyboardMode(field === "phone" || field === "idNumber" ? "numeric" : "text");
    setKeyboardText(patientInfo[field] || "");
    setKeyboardVisible(true);
  };

  const handleKeyboardClose = () => {
    setKeyboardVisible(false);
    setFocusedField(null);
  };

  const startVoiceInput = (field: KeyboardField) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ voice input");
      return;
    }
    if (!field) {
      alert("Vui lòng chọn một ô nhập trước khi ghi âm");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "vi-VN"; // hoặc "en-US"
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onstart = () => {
        setIsListening(true); // Bắt đầu ghi âm
      };

      recognitionRef.current.onend = () => {
        setIsListening(false); // Dừng ghi âm
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (focusedFieldRef.current) {
          setPatientInfo((prev) => ({
            ...prev,
            [focusedFieldRef.current!]: transcript,
          }));
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };  
  const searchPatient = async (name: string, type: number) => {
    await withLoading(
      async () => {
        const respone = await searchPatientInfoByType(name, type);
        if (respone && respone.length > 1){
          setPatientCandidates(respone)
          setPatientSelectOpen(true)
        }
        else if (respone && respone.length === 1) {
          const newBirthDate = new Date(respone[0].Birthday);
          if (newBirthDate) {
            datePickerHookRef.current.setValue(newBirthDate);
          }
          setPatientInfo({
            id: respone[0].Ma,
            fullname: respone[0].Hoten,
            address: respone[0].Diachi,
            birthDateString: newBirthDate ? formatDateForInput(newBirthDate) : "",
            gender: respone[0].Gioitinh,
            idNumber: respone[0].SoCMND,
            insuranceNumber: respone[0].SoBHYT,
            phone: respone[0].Dienthoai,
          })
        }
        else {
          showErrorDialog("Không tìm thấy bệnh nhân", "Vui lòng kiểm tra lại thông tin hoặc đăng ký bệnh nhân mới.", "warning" )
        }
      },
      "Đang tìm kiếm bệnh nhân",
      "Đang tra cứu trong hệ thống..."
    );
  }
  const handleSelectPatient = (p: BV_QlyCapThe) => {
    const newBirthDate = new Date(p.Birthday);
    if (newBirthDate) {
      datePickerHookRef.current.setValue(newBirthDate);
    }
    setPatientInfo({
      id: p.Ma,
      fullname: p.Hoten,
      address: p.Diachi,
      birthDateString: newBirthDate ? formatDateForInput(newBirthDate) : "",
      gender: p.Gioitinh,
      idNumber: p.SoCMND,
      insuranceNumber: p.SoBHYT,
      phone: p.Dienthoai,
    })
    setPatientSelectOpen(false)
  }
    const handlePrint = () => {
      const svg = document.createElement("svg");
      JsBarcode(svg, patientInfo.id || "0", {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: false,
        margin: 0,
      });
    const barcodeHTML = svg.outerHTML;
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title></title>
        <style>
          body {
            font-family: "Courier New", monospace;
            width: 280px; /* chiều rộng giống giấy in bill */
            margin: 0 auto;
            padding: 10px;
          }
          .title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 15px;
          }
          .header {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
            text-align: center;
          }

          .line {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          .queue-label {
            font-size: 14px;
            margin: 10px 0;
            text-align: center;
          }

          .queue-number {
            font-size: 72px;
            font-weight: bold;
            margin: 10px 0;
            text-align: center; 
          }

          .footer {
            margin-top: 10px;
            font-size: 12px;
          }

          .social {
            margin: 8px 0;
            font-size: 12px;
          }

          .date-time {
            margin-top: 10px;
            font-size: 14px;
            text-align: right;
          }
          .barcode {
            margin-top: 10px;
            text-align: center;
          }
        </style>
        </head>
        <body onload="window.print()">
        <div class="title">BỆNH VIỆN ĐA KHOA LÊ NGỌC TÙNG</div>
          <div class="header">THÔNG TIN ĐĂNG KÝ</div>
          <div class="queue-label">Loại khám: ${selectedExamType === "bhyt" ? "BHYT" : selectedExamType === "dv" ? "Dịch vụ" : "Khám sức khỏe"}</div>
          <div class="line"></div>
          <div class="queue-label">SỐ THỨ TỰ</div>
          <div class="queue-number">${patientInfo.queueNumber}</div>
          <div class="footer">
            Họ tên: ${patientInfo.fullname}</br>
            Ngày sinh: ${patientInfo.birthDateString}</br>
            Giới tính: ${patientInfo.gender}</br>
            Địa chỉ: ${patientInfo.address}</br>
            Số CCCD: ${patientInfo.idNumber}</br>
            Số thẻ BHYT: ${patientInfo.insuranceNumber || "N/A"}</br>
            Số điện thoại: ${patientInfo.phone || "N/A"}</br>
          </div>
          ${patientInfo.id ? `<div class="barcode">${barcodeHTML}</div>` : ''}
          <div class="line"></div>
          <div class="date-time">
            ${patientInfo.registrationTime}
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onafterprint = () => {
        printWindow.close(); // tự đóng tab in
      };
    }}
    
      const closeErrorDialog = () => {
      setErrorDialog({
        open: false,
        title: "",
        message: "",
        type: "error",
      })
    }
   const [errorDialog, setErrorDialog] = useState<ErrorDialog>({
    open: false,
    title: "",
    message: "",
    type: "error",
  })
  
  const errorDialogRef = useClickOutside<HTMLDivElement>(() => {
    if (errorDialog.open) {
      closeErrorDialog()
    }
  }, errorDialog.open)
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    id: "",
    fullname: "",
    phone: "",
    address: "",
    birthDateString: "",
    idNumber: "",
    insuranceNumber: "",
    gender: "Nam",
    chiefComplaint: "",
    queueNumber: "",
    registrationTime: ""
  })
  useEffect(() => {
  focusedFieldRef.current = focusedField;
}, [focusedField]);

// Format datetime theo dạng từ dd/mm/yyyy sang Date react
function parseDDMMYYYY(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day));
}
const formatDateForInput = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }, []);
  useEffect(() => {
    const handler = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      document.removeEventListener("click", handler);
    };

    document.addEventListener("click", handler);

    return () => document.removeEventListener("click", handler);
  }, []);
// Đồng bộ hóa giữa datePickerHook và patientInfo.birthDateString
useEffect(() => {
  if (datePickerHook.value) {
    const formattedDate = formatDateForInput(datePickerHook.value);
    setPatientInfo(prev => {
      // Chỉ update nếu giá trị thực sự thay đổi
      if (prev.birthDateString !== formattedDate) {
        return {
          ...prev,
          birthDateString: formattedDate
        };
      }
      return prev;
    });
  }
}, [datePickerHook.value, formatDateForInput]);

useEffect(() => {
  const initalCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
    } 
    initalCamera();
})

  useEffect(() => {
    console.log("Initializing camera and QR scanner...");  
    const scanner = createQRScanner({
      onStatus:(status) => console.log(status),
      onConnect: (connected) => {if(connected) {setIsConnectPort(true)} else {setIsConnectPort(false)}},
      onData: (data) => {
        if(data !== null) {
          console.log("QR Data:", data);          
          // Set giá trị cho datePickerHook nếu có birthDate
          if (data.birthDate) {
            datePickerHookRef.current.setValue(data.birthDate);
          }
          
          setPatientInfo({
            id: "",
            fullname: data.fullname || "",
            gender: data.gender || "",
            phone: data.phone || "",
            address: data.address || "",
            birthDateString: data.birthDate ? formatDateForInput(data.birthDate) : "",
            idNumber: data.idNumber || "",
            insuranceNumber: data.insuranceNumber || "",
            chiefComplaint: data.chiefComplaint || ""        
          })
        }
      }
    });
    scannerRef.current = scanner;
    scannerRef.current?.autoConnect();
    if (!scannerRef.current.onConnect){
      setIsConnectPort(true)
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.disconnect();
      }
    };
  }, [formatDateForInput]);
  const examTypes = [
    {
      id: "bhyt" as ExamType,
      title: "Khám BHYT",
      subtitle: "Sử dụng bảo hiểm y tế",
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      color: "#2196F3",
    },
    {
      id: "dv" as ExamType,
      title: "Khám dịch vụ",
      subtitle: "Khám theo yêu cầu",
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      color: "#4CAF50",
    },
    {
      id: "ksk" as ExamType,
      title: "Khám sức khỏe",
      subtitle: "Khám tổng quát định kỳ",
      icon: <HealthAndSafety sx={{ fontSize: 40 }} />,
      color: "#FF9800",
    },
  ]
  const resetKiosk = () => {
    setCurrentStep("form")
    setSelectedExamType(null)
    setPatientInfo({
      id: "",
      fullname: "",
      phone: "",
      address: "",
      birthDate: CURRENT_DATE,
      idNumber: "",
      insuranceNumber: "",
      queueNumber: "",
      registrationTime: "",
      gender: "Nam",
      chiefComplaint: "",
    })
    datePickerHookRef.current.setValue(CURRENT_DATE);
  }
  const handleExamTypeSelect = (type: ExamType) => {
    setSelectedExamType(type)
  }
    const handleFormSubmit = async () => {
    (() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setPhoto(canvas.toDataURL("image/jpeg"));
        }
      })();
    if (selectedExamType === null) {
      showErrorDialog("Chưa chọn loại khám", "Vui lòng chọn loại hình khám bệnh để tiếp tục.", "warning")
      return
    }
    if (selectedExamType === "bhyt" && !patientInfo.insuranceNumber) {
      showErrorDialog(
        "Thiếu số thẻ BHYT",
        "Vui lòng nhập số thẻ bảo hiểm y tế để tiếp tục đăng ký khám bệnh.",
        "warning",
      )
      return
    }
    
    await withLoading(
      async () => {
        const respone = await dangKyKhamBenh({
            id: patientInfo.id || "",
            fullname: patientInfo.fullname,
            idNumber: patientInfo.idNumber,
            insuranceNumber: patientInfo.insuranceNumber,
            birthDate: patientInfo.birthDateString ? parseDDMMYYYY(patientInfo.birthDateString) : undefined, 
            gender: patientInfo.gender as "Nam" | "Nữ",
            phone: patientInfo.phone,
            address: patientInfo.address,
            quay: selectedExamType,
            chiefComplaint: patientInfo.chiefComplaint || "",
            anh: photo || null,
          });
          const registrationTime = DateUtils.getCurrentDateFormatted("vi-VN")
          if(respone.status === "success" && respone.data && respone.data.length > 0) {
            const queueNumber = respone.data[0].SoThuTu
            setPatientInfo((prev) => ({
              ...prev,
              queueNumber,
              registrationTime,
            }))
            setCurrentStep("success")
          }
          else{
            showErrorDialog(
              "Đăng ký thất bại",
              respone.message || "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại hoặc liên hệ quầy lễ tân để được hỗ trợ.",
              "error",
            )
            resetKiosk();
          }
      },
      "Đang đăng ký khám bệnh",
      "Vui lòng chờ trong giây lát..."
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        background: "white",
      }}
    >
      <Container maxWidth="xl" sx={{position: "relative", height: "90%",}}>
        {currentStep === "form" && (<HeaderBVLNT />)}
          {/* Exam Type Selection */}
          {currentStep === "form" && (
          <Box>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "180px" }}>
            <Grid container spacing={6} justifyContent="center">
              {examTypes.map((type) => {
                const isSelected = selectedExamType === type.id
                const isHidden = selectedExamType !== null && !isSelected
                return (
                  <Grid                 
                    size={4}
                    key={type.id}
                    sx={{
                      transition: "all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                      opacity: isHidden ? 0.5 : 1,
                      minWidth: 250,
                    }}
                  >
                      <Card
                      elevation={3}
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          transformOrigin: "center",
                          willChange: "transform, box-shadow, border-color, background",
                          boxShadow: isSelected ? `0 20px 60px ${type.color}30` : "0 4px 20px rgba(0,0,0,0.08)",
                          border: isSelected ? `3px solid ${type.color}` : "3px solid transparent",
                          background: isSelected
                            ? `linear-gradient(135deg, ${type.color}15 0%, ${type.color}25 100%)`
                            : "white",
                          backdropFilter: isSelected ? "blur(15px)" : "none",
                          "&:hover": !isSelected
                            ? {
                                boxShadow: `0 12px 40px ${type.color}25`,
                                borderColor: `${type.color}40`,
                              }
                            : {
                                boxShadow: `0 25px 80px ${type.color}40`,
                              },
                          "&:active": {
                            transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                          },
                        }}
                        onClick={() => (isSelected ? setSelectedExamType(null) : handleExamTypeSelect(type.id))}
                      >
                        <CardContent sx={{ textAlign: "center" }}>
                          <Box
                            sx={{
                              color: type.color,
                            }}
                          >
                            {type.icon}
                          </Box>
                          <Typography
                            variant={isSelected ? "h5" : "h6"}
                            sx={{
                              fontWeight: "bold",
                              color: isSelected ? type.color : "#333",
                            }}
                          >
                            {type.title}
                          </Typography>
                          <Typography
                            variant={isSelected ? "body1" : "body2"}
                            sx={{
                              color: "#666",
                            }}
                          >
                            {type.subtitle}
                          </Typography>
                        </CardContent>
                      </Card>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </Box>
        )}

        {currentStep === "form" && (
            <Card elevation={3} sx={{ maxWidth: 1920, mx: "auto" }}>
              <CardContent sx={{ p: 2 }}>                        
                <Grid container spacing={3}>
                <Grid size={4}>
                    <DebouncedTextField
                      fullWidth
                      label="Số điện thoại"
                      value={patientInfo.phone}
                      onFocus={() => setFocusedField("phone")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="secondary" />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "phone" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("phone")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "primary"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton onClick={() => {searchPatient(patientInfo.phone, 1)} }>
                                  <Search sx={{ color: "#2563eb" }} />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("phone")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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

                  <Grid size={4}>
                    <DebouncedTextField
                      fullWidth
                      label="Số CCCD" 
                      value={patientInfo.idNumber}
                      onFocus={() => setFocusedField("idNumber")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, idNumber: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <ContactEmergency sx={{ color: "#2563eb" }} />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "idNumber" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("idNumber")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "primary"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton onClick={() => {searchPatient(patientInfo.idNumber, 2)} }>
                                  <Search sx={{ color: "#2563eb" }} />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("idNumber")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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

                  <Grid size={4}>
                    <DebouncedTextField
                      fullWidth
                      label="Mã thẻ BHYT"
                      value={patientInfo.insuranceNumber}
                      onFocus={() => setFocusedField("insuranceNumber")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, insuranceNumber: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <IdCard sx={{ color: "#dc2626" }} />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "insuranceNumber" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("insuranceNumber")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "primary"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton onClick={() => {if (patientInfo.insuranceNumber){searchPatient(patientInfo.insuranceNumber, 3)}} }>
                                  <Search sx={{ color: "#2563eb" }} />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("insuranceNumber")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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
                  <Grid size={8}>
                    <DebouncedTextField
                      fullWidth
                      label="Họ và tên"
                      value={patientInfo.fullname}
                      onFocus={() => setFocusedField("fullname")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, fullname: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "fullname" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("fullname")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "#4a5770ff"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton onClick={() => {searchPatient(patientInfo.fullname, 0)} }>
                                  <Search sx={{ color: "#2563eb" }} />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("fullname")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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
                  <Grid size={2}>
                  <DebouncedTextField
                      fullWidth
                      label="Ngày sinh"
                      value={datePickerHook.formatDate(datePickerHook.value)}
                      onClick={datePickerHook.openPicker}
                      onChange={(e) => setPatientInfo({ ...patientInfo, birthDateString: e.target.value })}
                        slotProps={{
                          input: {
                            readOnly: true,
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
                      <DateWheelPickerPopup
                        isOpen={datePickerHook.isOpen}
                        onClose={datePickerHook.closePicker}
                        value={datePickerHook.value}
                        onChange={datePickerHook.setValue}
                      />
                  </Grid>
                  <Grid size={2}>
                    <RadioGroup
                      row
                      value={patientInfo.gender || "Nam"}
                      onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                    >
                      <FormControlLabel
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              Nam
                          </Box>
                        }
                        value="Nam"
                        control={<Radio sx={{ color: "#9333ea"}} />}
                      />
                      <FormControlLabel
                        value="Nữ"
                        control={<Radio sx={{ color: "#9333ea" }} />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              Nữ
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid size={12}>
                    <DebouncedTextField
                      fullWidth
                      label="Địa chỉ"
                      value={patientInfo.address}
                      onFocus={() => setFocusedField("address")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn sx={{ color: "#dc2626" }} />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "address" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("address")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "primary"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("address")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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
                  <Grid size={12}>
                    <DebouncedTextField
                      fullWidth
                      label="Lý do khám bệnh"
                      value={patientInfo.chiefComplaint}
                      onFocus={() => setFocusedField("chiefComplaint")}
                      onChange={(e) => setPatientInfo({ ...patientInfo, chiefComplaint: e.target.value })}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EditNote sx={{ color: "#dc2626" }} />
                              </InputAdornment>
                            ),
                            endAdornment: focusedField === "chiefComplaint" && (
                              <InputAdornment position="end">
                                <IconButton
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    startVoiceInput("chiefComplaint")
                                  }}
                                  sx={{
                                    color: isListening ? "red" : "primary"
                                  }}
                                >
                                  <Mic />
                                </IconButton>
                                <IconButton 
                                  onClick={() => handleFieldFocus("chiefComplaint")}
                                  sx={{ color: "#059669" }}
                                >
                                  <Keyboard />
                                </IconButton>
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

                <Box sx={{ display: "flex", justifyContent: "space-between", pt: 4, gap: 2, flexWrap: 'wrap' }}>
                  <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        height: 64,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        px: 4,
                        visibility: selectedExamType === 'bhyt' ? "visible" : "hidden"
                      }}
                      onClick={handleCheckBHYT}
                    >
                      Kiểm tra thẻ BHYT
                    </Button>
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
                    Hoàn tất đăng ký
                  </Button>
                  <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        height: 64,
                        fontSize: "1.25rem",
                        px: 6,
                        ml: 3,
                        visibility: isConnectPort ? "hidden" : "visible"
                      }}
                      onClick={() => scannerRef.current?.autoConnect()}
                    >
                      Kết nối thiết bị quét QR
                    </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          {currentStep === "success" && (
            <Card elevation={3} sx={{ maxWidth: 1200, mx: "auto", textAlign: "center" }}>
              <CardContent sx={{ p: 4}}>
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
                    <AssignmentLate sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: "bold", fontFamily: "sans-serif" }}>
                      SỐ THỨ TỰ CỦA BẠN
                    </Typography>
                  </Box>
                  <Typography variant="h1" sx={{ fontWeight: "bold", fontSize: "4rem", mb: 1 }}>
                    {patientInfo.queueNumber}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Loại khám: {selectedExamType === "bhyt" ? "BHYT" : selectedExamType === "dv" ? "Dịch vụ" : "Khám sức khỏe"}
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
                    <Grid size={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Họ tên:</strong> {patientInfo.fullname}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Ngày sinh:</strong> {patientInfo.birthDateString?.replace(/-/g, "/")}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Số điện thoại:</strong> {patientInfo.phone}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Giới tính:</strong> {patientInfo.gender}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Số CCCD:</strong> {patientInfo.idNumber}
                      </Typography>
                      {selectedExamType === "bhyt" && (
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
                    Thoát
                  </Button>
                </Box>

                <Typography variant="body1" sx={{ mt: 3, color: "text.secondary", fontStyle: "italic" }}>
                  Vui lòng giữ phiếu đăng ký và đợi đến lượt để hoàn tất thủ tục khám bệnh
                </Typography>
              </CardContent>
            </Card>
          )}
        
      </Container>
      <Dialog
        open={patientSelectOpen}
        onClose={() => setPatientSelectOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
          ref: patientSelectDialogRef
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Chọn bệnh nhân</DialogTitle>
        <DialogContent dividers>
          <List>
            {patientCandidates.map((p, idx) => (
              <>
                <ListItemButton key={p.Ma} onClick={() => handleSelectPatient(p)}>
                  <ListItemText
                    primary= {p.Hoten}
                    secondary={`${p.Birthday ? `Ngày sinh: ${p.Birthday} • ` : ""}${p.Dienthoai ? `SDT: ${p.Dienthoai} • ` : ""}${p.SoCMND ? `CCCD: ${p.SoCMND} • ` : ""}${p.SoBHYT ? `BHYT: ${p.SoBHYT} • ` : ""}${p.Diachi ? `Đ/c: ${p.Diachi}` : ""}`}
                  />
                </ListItemButton>
                {idx < patientCandidates.length - 1 && <Divider component="li" />}
              </>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientSelectOpen(false)} variant="outlined">Đóng</Button>
        </DialogActions>
      </Dialog>
       <Dialog
          open={errorDialog.open}
          onClose={closeErrorDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
            },
            ref: errorDialogRef
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              pb: 2,
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {errorDialog.type === "error" && <Error sx={{ color: "#dc2626", fontSize: 32 }} />}
            {errorDialog.type === "warning" && <Warning sx={{ color: "#ea580c", fontSize: 32 }} />}
            {errorDialog.type === "info" && <CheckCircle sx={{ color: "#059669", fontSize: 32 }} />}
            {errorDialog.title}
          </DialogTitle>

          <DialogContent sx={{ pb: 3 }}>
            <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
              {errorDialog.message}
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={closeErrorDialog}
              variant="contained"
              size="large"
              sx={{
                height: 48,
                fontSize: "1.1rem",
                fontWeight: 600,
                px: 4,
                background:
                  errorDialog.type === "error"
                    ? "linear-gradient(45deg, #dc2626 30%, #b91c1c 90%)"
                    : errorDialog.type === "warning"
                      ? "linear-gradient(45deg, #ea580c 30%, #c2410c 90%)"
                      : "linear-gradient(45deg, #059669 30%, #047857 90%)",
              }}
            >
              Đã hiểu
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Loading Overlay */}
        <LoadingOverlay
          open={loading}
          message={message}
          subMessage={subMessage}
          type="spinner"
          backdrop={true}
        />
        
      <div className="p-4 flex flex-col gap-4 items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="border rounded-lg w-80 h-60 bg-black hidden"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* {photo && (
        <Image src={photo} alt="Ảnh đã chụp" className="border rounded-lg w-80 hidden" />
      )} */}
    </div>

      {/* Bàn phím ảo */}
      <VirtualKeyboard
        visible={keyboardVisible}
        onClose={handleKeyboardClose}
        onTextChange={handleKeyboardTextChange}
        currentText={keyboardText}
        keyboardMode={keyboardMode}
      />
    </Box>
  )
}
