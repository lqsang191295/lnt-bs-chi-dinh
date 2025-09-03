"use client";
import {
  PatientInfo,
} from "@/model/dangkykhambenh";

declare global {
  interface Navigator {
    serial?: {
      getPorts: () => Promise<any[]>;
      requestPort: () => Promise<any>;
    };
  }
  var currentType: string | undefined;
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

  let portRef: any | null = null;
  let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;
  async function startReading(): Promise<void> {
    if (!portRef?.readable) return;
    const reader = portRef.readable?.getReader();
    // Đọc dữ liệu liên tục
    while (true) {
      try {
        console.log('🔄 Waiting for data...');
        const { value, done } = await reader.read();
        
        if (done) {
          console.log('📖 Reader đã đóng');
          break;
        }

        if (value) {
          // Chuyển đổi dữ liệu thành chuỗi
          const chunk = new TextDecoder().decode(value);
          const clean = chunk.trim();
          if (clean) {
            const parts: string[] = clean.split("|");
            if (parts[0].length === 15) {
                onData?.(ConvertRawQRCodeToObject(parts) as PatientInfo);
            }
            else if (parts[0].length === 12) {
              onData?.(ConvertRawQRCCDCodeToObject(parts) as PatientInfo);
            } else {
              onStatus?.("Dữ liệu không đúng định dạng.");
            }
          }
        } else {
          console.log('⚠️ Received empty value');
        }
      } catch (error) {
        console.error('❌ Lỗi khi đọc dữ liệu:', error);
        // this.onErrorCallback?.(error instanceof Error ? error : new Error('Lỗi đọc dữ liệu'));
        break;
      }
    }
  }
  function hexToUtf8(hex: string): string {
    try{
      hex = hex.replace(/\s+/g, "");
       const bytes = new Uint8Array(
          hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(bytes);
      }
      catch{
        return "";
      }
    }
    function ConvertRawQRCodeToObject(rawData: string[]): PatientInfo | null {
        if (rawData[0].trim().length !== 15) {
            onStatus?.("Mã số BHYT Không đúng định dạng");
            return null;
        }
        // const ngayHieuLucBHYT = rawData[6].trim(); // YYYYMMDD
        // if (ngayHieuLucBHYT > new Date().toISOString().slice(0, 10).replace(/-/g, "")) {
        //     onStatus?.("Thẻ BHYT chưa có hiệu lực.");
        //     return null;
        // }
        // const ngayHetHanBHYT = rawData[7].trim(); // YYYYMMDD
        // if (ngayHetHanBHYT < new Date().toISOString().slice(0, 10).replace(/-/g, "")) {
        //     onStatus?.("Thẻ BHYT đã hết hạn.");
        //     return null;
        // }
        
        return {
            fullname: hexToUtf8(rawData[1].trim()),
            insuranceNumber: rawData[0].trim(),
            birthDate: parseToDate(rawData[2].trim()) || undefined,
            gender: rawData[3].trim() === "Nam" ? "Nam" : "Nữ",
            phone: "",
            idNumber: "",
            address: hexToUtf8(rawData[4].trim()),
    }
}
  function ConvertRawQRCCDCodeToObject(rawData: string[]): PatientInfo | null {
    if (!rawData[3] || rawData[3].length !== 8) return null; // kiểm tra chuỗi hợp lệ

    const day = parseInt(rawData[3].substring(0, 2), 10);
    const month = parseInt(rawData[3].substring(2, 4), 10) - 1; // JS tính tháng từ 0-11
    const year = parseInt(rawData[3].substring(4, 8), 10);
    const patient: PatientInfo = {
        fullname: rawData[2].trim(),
        idNumber: rawData[0].trim(),
        birthDate:  new Date(year, month, day) || undefined,
        gender: rawData[4].trim() === "Nam" ? "Nam" : "Nữ",
        phone: "",
        address: rawData[5].trim()
      };
      return patient;
    }
    function parseToDate(input: string): Date | null {
  // Nếu chỉ có năm
    if (/^\d{4}$/.test(input)) {
      const y = parseInt(input, 10);
      return new Date(y, 0, 1); // 01/01/yyyy
    }
    // Nếu có dạng dd/MM/yyyy hoặc d/M/yyyy
    const parts = input.split(/[\/\-]/);
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // tháng bắt đầu từ 0
      const y = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }

    return null; // không parse được
  }
  async function clearBuffer(port: any) {
  const reader = port.readable?.getReader();
  try {
    await reader.cancel();  
  } catch (err) {
    console.warn("Error clearing buffer", err);
  } finally {
    reader.releaseLock();
  }
}
  async function connectToPort(port: any) {
    try {
      if (!port.readable) {
      await port.open({ 
        baudRate: 2400, // Tốc độ baud mặc định
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 1024,
        flowControl: 'none'});
      }
      portRef = port;
      await clearBuffer(portRef);
      onConnect?.(true);
      onStatus?.("Đã kết nối.");
      await startReading();
    } catch (e) {
      console.error("Kết nối thất bại", e);
      onStatus?.("Không thể mở cổng COM.");
      onConnect?.(false);
    }
  }

  async function requestPortFirstTime() {
    if (!navigator.serial) {
      onStatus?.("Trình duyệt không hỗ trợ Web Serial API.");
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await connectToPort(port);
    } catch (e: any) {
      onStatus?.(e.toString());
      onStatus?.("Người dùng chưa cấp quyền hoặc đã hủy.");
    }
  }

  async function disconnect() {
    onStatus?.("Đang ngắt kết nối...");
    try {
      if (readerRef) {
        try {
          await readerRef.cancel();
        } catch (err) {
          console.warn("Error cancelling reader", err);
        }
        try {
          readerRef.releaseLock();
          console.log("Reader lock released");
        } catch {}
        readerRef = null;
      }
      if (portRef) {
        try {
          await portRef.close();
        } catch (err) {
          console.warn("Error closing port", err);
        }
        portRef = null;
      }
      onConnect?.(false);
      onStatus?.("Đã ngắt kết nối.");
    } catch (err) {
      console.error("Error during disconnect", err);
      onStatus?.("Có lỗi khi ngắt kết nối.");
    }
  }

  async function autoConnect() {
    if (!navigator.serial) {
      onStatus?.("Trình duyệt không hỗ trợ Web Serial API.");
      return;
    }
    const ports = await navigator.serial.getPorts();
    if (ports.length > 0) {
      onStatus?.("Đã tìm thấy cổng được cấp quyền, đang kết nối lại...");
      await connectToPort(ports[0]);
    } else {
      await requestPortFirstTime();
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
