"use client";
import {
  PatientInfo,
} from "@/model/dangkykhambenh";

declare global {
  interface Navigator {
    serial?: {
      getPorts: () => Promise<SerialPort[]>;
      requestPort: () => Promise<SerialPort>;
    };
  }
  var currentType: string | undefined;
}

// Định nghĩa các interface cho Serial API
interface SerialPort {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open: (options: SerialOptions) => Promise<void>;
  close: () => Promise<void>;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

export function setTypeQR(val: string) {
  globalThis.currentType = val;
}

type OnData = (data: PatientInfo) => void;
type OnStatusFn = (s: string) => void;
type OnConnectFn = (connected: boolean) => void;

/**
 * Factory that creates QR/serial scanner handlers.
 * Returns functions that can be called from a component (e.g. inside useEffect).
 */
export function createQRScanner(opts?: {
  onData?: OnData;
  onStatus?: OnStatusFn;
  onConnect?: OnConnectFn;
}) {
  const onData = opts?.onData;
  const onStatus = opts?.onStatus;
  const onConnect = opts?.onConnect;

  let portRef: SerialPort | null = null;
  let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let isReading = false;
 
// Improved startReading function with better error handling
async function startReading(): Promise<void> {
  if (!portRef?.readable || isReading) {
    console.log('❌ Cannot start reading - port not ready or already reading');
    return;
  }
  
  isReading = true;
  const reader = portRef.readable.getReader();
  readerRef = reader;
  
  let buffer = ''; // Buffer để tích lũy dữ liệu
  const decoder = new TextDecoder('utf-8');
  
  onStatus?.("🔍 Đang chờ dữ liệu QR...");
  
  try {
    while (isReading && portRef) {
      try {
        const { value, done } = await reader.read();
        
        if (done) {
          console.log('📖 Reader stream ended');
          break;
        }

        if (value && value.length > 0) {
         
          // Decode chunk hiện tại và thêm vào buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
                   
          // Kiểm tra xem có QR code hoàn chỉnh không
          // QR scanner thường kết thúc bằng CR, LF, hoặc CR+LF
          if (buffer.includes('\r') || buffer.includes('\n') || buffer.includes('$')) {
            await processCompleteQRData(buffer);
            buffer = ''; // Reset buffer sau khi xử lý
          }
          
          // Nếu buffer quá dài mà chưa có delimiter, xử lý luôn
          if (buffer.length > 500) { // Giảm từ 1000 xuống 500
            await processCompleteQRData(buffer);
            buffer = '';
          }
        } else {
          // No data received, add small delay to prevent busy waiting
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (readError) {
        console.error('❌ Error in read loop:', readError);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait before retrying
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('📖 Reading was cancelled');
    } else {
      console.error('❌ Error reading data:', error);
      onStatus?.('Lỗi khi đọc dữ liệu từ cổng serial');
    }
  } finally {
    // Xử lý dữ liệu còn lại trong buffer
    if (buffer.trim()) {
      console.log('🔄 Processing remaining buffer data...');
      await processCompleteQRData(buffer);
    }
    
    try {
      reader.releaseLock();
    } catch (e) {
      console.warn('Warning releasing reader lock:', e);
    }
    
    readerRef = null;
    isReading = false;
  }
}

  // Hàm xử lý QR data hoàn chỉnh

// Improved processCompleteQRData with better debugging
async function processCompleteQRData(buffer: string): Promise<void> {
  try {
    // Loại bỏ các ký tự xuống dòng và ký tự đặc biệt ở cuối
    const cleanData = buffer.replace(/[\r\n$\x00-\x1F\x7F]+/g, '').trim();
        
    if (!cleanData || cleanData.length < 10) {
      onStatus?.('⚠️ Dữ liệu QR quá ngắn hoặc không hợp lệ');
      return;
    }
    
    // Tách dữ liệu bằng dấu |
    const parts = cleanData.split('|');
    
    // Rest of the processing logic remains the same...
    if (parts.length >= 7) {
      if ((parts.length === 7 || parts.length === 11) && /^\d{12}$/.test(parts[0])) {
        const patientInfo = ConvertRawQRCCDCodeToObject(parts);
        if (patientInfo) {
          onData?.(patientInfo);
        }
      } 
      else if (parts.length >= 14) {
        const patientInfo = ConvertRawQRBHYTCodeToObject(parts);
        if (patientInfo) {
          onData?.(patientInfo);
          onStatus?.(`✅ Đã quét BHYT thành công: ${patientInfo.fullname}`);
        }
      }
      else {
        onStatus?.(`⚠️ Định dạng QR không xác định (${parts.length} phần tử)`);
      }
    } else {
      onStatus?.(`⚠️ Dữ liệu QR không đủ thông tin (${parts.length} phần tử)`);
    }
  } catch (error) {
    console.error('❌ Lỗi xử lý QR data:', error);
    onStatus?.('Lỗi xử lý dữ liệu QR');
  }
}
 

  // Hàm chuyển đổi QR BHYT
  function ConvertRawQRBHYTCodeToObject(rawData: string[]): PatientInfo | null {
    try {      
      if (rawData.length < 10) {
        onStatus?.('Dữ liệu BHYT không đầy đủ');
        return null;
      }
      
      // Format BHYT:
      // [0] = Mã thẻ BHYT
      // [1] = Họ tên (hex encoded)  
      // [2] = Ngày sinh (DD/MM/YYYY hoặc YYYY)
      // [3] = Giới tính (1=Nam, 2=Nữ)
      // [4] = Địa chỉ (có thể là hex hoặc "-")
      // [5] = Mã khu vực
      // [6] = Ngày hiệu lực
      // [7] = Trạng thái
      // [8] = Ngày hết hạn  
      // [9] = Mã thẻ kèm mã khu vực
      
      const insuranceNumber = rawData[0].trim();
      const fullnameHex = rawData[1].trim();
      const birthDateStr = rawData[2].trim();
      const genderCode = rawData[3].trim();
      const addressData = rawData[4].trim();
      
      // Chuyển đổi hex sang UTF-8 cho tên
      const fullname = hexToUtf8(fullnameHex);
      if (!fullname) {
        console.error('❌ Cannot decode fullname from hex:', fullnameHex);
        onStatus?.('Không thể đọc tên từ dữ liệu BHYT');
        return null;
      }
      
      // Chuyển đổi giới tính
      const gender = genderCode === '1' ? 'Nam' : 'Nữ';
      
      // Xử lý địa chỉ
      let address = '';
      if (addressData && addressData !== '-') {
        const decodedAddress = hexToUtf8(addressData);
        address = decodedAddress || addressData;
      }
      
      // Xử lý ngày sinh
      const birthDate = parseToDate(birthDateStr);
      
      return {
        fullname: fullname,
        insuranceNumber: insuranceNumber,
        birthDate: birthDate || undefined,
        gender: gender,
        phone: "",
        idNumber: "",
        address: address
      };
      
    } catch (error) {
      console.error('❌ Lỗi chuyển đổi BHYT:', error);
      onStatus?.('Lỗi xử lý dữ liệu BHYT');
      return null;
    }
  }

  // Hàm chuyển đổi QR CCCD
  function ConvertRawQRCCDCodeToObject(rawData: string[]): PatientInfo | null {
    try {
      
      if (rawData.length === 7 || rawData.length === 11) {
              // Format CCCD:
      // [0] = Số CCCD (12 số)
      // [1] = Mã số (cmnd cũ)
      // [2] = Họ và tên
      // [3] = Ngày sinh (DDMMYYYY)
      // [4] = Giới tính (Nam/Nữ)
      // [5] = Địa chỉ
      // [6] = Ngày cấp (DDMMYYYY)
      
      const idNumber = rawData[0].trim();
      const fullname = rawData[2].trim();
      const birthDateStr = rawData[3].trim(); // DDMMYYYY
      const genderStr = rawData[4].trim();
      const address = rawData[5].trim();   
      
      // Chuyển đổi ngày sinh từ DDMMYYYY
      let birthDate: Date | undefined;
      if (birthDateStr && birthDateStr.length === 8) {
        const day = parseInt(birthDateStr.substring(0, 2), 10);
        const month = parseInt(birthDateStr.substring(2, 4), 10) - 1; // JS tháng từ 0-11
        const year = parseInt(birthDateStr.substring(4, 8), 10);
        birthDate = new Date(year, month, day);
      }
      // Chuẩn hóa giới tính
      const gender = genderStr.toLowerCase().includes('nam') ? 'Nam' : 'Nữ';   
      return {
        fullname: fullname,
        idNumber: idNumber,
        birthDate: birthDate,
        gender: gender,
        phone: "",
        insuranceNumber: "",
        address: address
      };

      }
        onStatus?.('Dữ liệu CCCD không đầy đủ');
        return null;

      
    } catch (error) {
      console.error('❌ Lỗi chuyển đổi CCCD:', error);
      onStatus?.('Lỗi xử lý dữ liệu CCCD');
      return null;
    }
  }

  // Hàm chuyển đổi hex sang UTF-8
  function hexToUtf8(hex: string): string {
    try {
      if (!hex || hex === '-') return '';
      
      // Loại bỏ khoảng trắng và ký tự không hợp lệ
      hex = hex.replace(/\s+/g, "").replace(/[^0-9a-fA-F]/g, "");
      
      // Kiểm tra độ dài hex hợp lệ (phải chẵn)
      if (hex.length === 0 || hex.length % 2 !== 0) {
        console.warn('Invalid hex length:', hex.length);
        return '';
      }
      
      const bytes = new Uint8Array(
        hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      const decoder = new TextDecoder("utf-8");
      const result = decoder.decode(bytes);
      return result;
    } catch (error) {
      console.error('Error decoding hex to UTF-8:', error);
      return "";
    }
  }

  // Hàm parse date
  function parseToDate(input: string): Date | null {
    try {
      if (!input || input === '-') return null;
            
      // Format: DD/MM/YYYY
      if (input.includes('/')) {
        const parts = input.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // tháng từ 0-11
          const year = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          return date;
        }
      }
      
      // Format: DDMMYYYY
      if (/^\d{8}$/.test(input)) {
        const day = parseInt(input.substring(0, 2), 10);
        const month = parseInt(input.substring(2, 4), 10) - 1;
        const year = parseInt(input.substring(4, 8), 10);
        const date = new Date(year, month, day);
        return date;
      }
      
      // Format: YYYY (chỉ có năm)
      if (/^\d{4}$/.test(input)) {
        const year = parseInt(input, 10);
        const date = new Date(year, 0, 1); // 01/01/yyyy
        return date;
      }
      
      console.warn('Unknown date format:', input);
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  // Hàm kết nối tới port
 
// Fixed connectToPort function
async function connectToPort(port: SerialPort) {
  try {
    onStatus?.("🔄 Đang kết nối đến cổng COM...");
    
    // Check if port is already open
    if (port.readable) {
      try {
        await port.close();
        // Wait a bit after closing
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (closeError) {
        console.warn('Warning closing existing connection:', closeError);
      }
    }
    
    // Open port with your specific settings
    await port.open({ 
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 4096,
      flowControl: 'none'
    });
       
    portRef = port;
    
    // Wait for port to be fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear buffer trước khi bắt đầu đọc - KHÔNG sử dụng reader
    await clearBufferSafe(portRef);
    
    onConnect?.(true);
    onStatus?.("✅ Đã kết nối COM. Sẵn sàng quét QR...");
    
    // Test connection WITHOUT creating reader
    const testResult = await testConnection();
    
    if (testResult) {
      // Start reading immediately - NO delay
      await startReading();
    } else {
      console.error('❌ Port test failed');
      onStatus?.("❌ Test kết nối thất bại");
    }
    
  } catch (e) {
    console.error("❌ Connection failed:", e);
    
    if (e instanceof Error) {
      console.error("❌ Error name:", e.name);
      console.error("❌ Error message:", e.message);
      
      if (e.message.includes('Failed to open serial port')) {
        onStatus?.("❌ Không thể mở cổng COM. Kiểm tra thiết bị đã kết nối chưa.");
      } else if (e.message.includes('Access denied')) {
        onStatus?.("❌ Không có quyền truy cập COM. Đóng các ứng dụng khác đang sử dụng cổng này.");
      } else if (e.message.includes('Device not found')) {
        onStatus?.("❌ Không tìm thấy thiết bị COM. Kiểm tra driver và kết nối USB.");
      } else {
        onStatus?.(`❌ Lỗi kết nối: ${e.message}`);
      }
    } else {
      onStatus?.("❌ Lỗi không xác định khi kết nối.");
    }
    
    onConnect?.(false);
    portRef = null;
  }
}

// Safe buffer clearing without creating reader
async function clearBufferSafe(port: SerialPort) {
  console.log('🧹 Preparing buffer for reading...', port);
  // Chỉ log, không thực sự clear buffer để tránh lock reader
  // Buffer sẽ được xử lý trong startReading()
}

// Enhanced autoConnect function
async function autoConnect() {
  if (!navigator.serial) {
    onStatus?.("❌ Trình duyệt không hỗ trợ Web Serial API.");
    return;
  }
  
  try {
    onStatus?.("🔍 Đang tìm kiếm cổng COM...");
    
    const ports = await navigator.serial.getPorts();
    
    if (ports.length > 0) {
      onStatus?.("🔄 Đã tìm thấy cổng được cấp quyền, đang kết nối lại...");
      
      // Try to connect to each port until one works
      for (let i = 0; i < ports.length; i++) {
        try {
          await connectToPort(ports[i]);
          return; // Success, exit
        } catch (error) {
          console.warn(`⚠️ Failed to connect to port ${i + 1}:`, error);
          if (i === ports.length - 1) {
            // Last port failed
            throw error;
          }
        }
      }
    } else {
      onStatus?.("📝 Chưa có cổng nào được cấp quyền, yêu cầu chọn cổng...");
      await requestPortFirstTime();
    }
  } catch (error) {
    console.error('❌ Auto connect failed:', error);
    onStatus?.("❌ Lỗi kết nối tự động. Thử kết nối thủ công.");
  }
}

 
// Enhanced requestPortFirstTime function
async function requestPortFirstTime() {
  if (!navigator.serial) {
    onStatus?.("❌ Trình duyệt không hỗ trợ Web Serial API.");
    return;
  }
  
  try {
    onStatus?.("📋 Vui lòng chọn cổng COM từ danh sách...");
    
    // Request port with filter for common QR scanner vendor IDs (optional)
    const port = await navigator.serial.requestPort();
    
    await connectToPort(port);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('❌ Port request failed:', errorMessage);
    
    if (errorMessage.includes('AbortError') || errorMessage.includes('cancelled')) {
      onStatus?.("❌ Người dùng đã hủy chọn cổng.");
    } else {
      onStatus?.("❌ Lỗi khi yêu cầu quyền truy cập cổng COM.");
    }
  }
}
 
// Enhanced testConnection function - KHÔNG tạo reader riêng
async function testConnection() {
  if (!portRef || !portRef.readable) {
    onStatus?.("❌ Không có cổng kết nối để test");
    return false;
  }
  
  onStatus?.("🧪 Đang kiểm tra kết nối...");
  
  // Chỉ kiểm tra port properties, KHÔNG đọc dữ liệu
  const isReadable = !!portRef.readable;
  const isWritable = !!portRef.writable;
  
  console.log('🧪 Port readable:', isReadable);
  console.log('🧪 Port writable:', isWritable);
  
  if (isReadable) {
    onStatus?.("✅ Cổng sẵn sàng - hãy thử quét QR");
    return true;
  } else {
    onStatus?.("❌ Cổng chưa sẵn sàng");
    return false;
  }
}

  async function disconnect() {
    console.log('🔌 Disconnecting...');
    onStatus?.("🔄 Đang ngắt kết nối...");
    
    try {
      isReading = false; // Stop reading loop
      
      if (readerRef) {
        try {
          await readerRef.cancel();
        } catch (err) {
          console.warn("Warning cancelling reader:", err);
        }
        try {
          readerRef.releaseLock();
        } catch (err) {
          console.warn("Warning releasing reader lock:", err);
        }
        readerRef = null;
      }
      
      if (portRef) {
        try {
          await portRef.close();
        } catch (err) {
          console.warn("Warning closing port:", err);
        }
        portRef = null;
      }
      
      onConnect?.(false);
      onStatus?.("✅ Đã ngắt kết nối.");
    } catch (err) {
      console.error("❌ Error during disconnect:", err);
      onStatus?.("❌ Có lỗi khi ngắt kết nối.");
    }
  }
  
 return {
  disconnect,
  autoConnect,
  onStatus,
  onData,
  onConnect
};
}
