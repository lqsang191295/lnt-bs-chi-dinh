"use client";

export class PdfHandler {
  /**
   * Chuyển đổi base64 string thành PDF Blob URL
   * @param base64Data - Chuỗi base64 của PDF
   * @returns Blob URL hoặc empty string nếu có lỗi
   */
  static createPdfBlobUrl(base64Data: string): string {
    try {
      // Loại bỏ data URL prefix nếu có
      const cleanBase64 = base64Data.replace(
        /^data:application\/pdf;base64,/,
        ""
      );

      // Chuyển đổi base64 thành binary
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Tạo Blob
      const blob = new Blob([bytes], { type: "application/pdf" });

      // Tạo và trả về Blob URL
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error creating PDF blob:", error);
      return "";
    }
  }

  /**
   * In PDF từ base64 data
   * @param base64Data - Chuỗi base64 của PDF
   * @param fileName - Tên file (không bao gồm extension)
   * @returns Promise<boolean> - true nếu thành công
   */
  static async printPdf(base64Data: string, fileName: string = "document"): Promise<boolean> {
    if (!base64Data) {
      console.error("No PDF data provided");
      return false;
    }

    try {
      const pdfBlobUrl = this.createPdfBlobUrl(base64Data);
      
      if (!pdfBlobUrl) {
        throw new Error("Failed to create PDF blob URL");
      }

      // Mở PDF trong cửa sổ mới để in
      const printWindow = window.open(pdfBlobUrl, '_blank');
      
      if (printWindow) {
        // Đợi PDF load xong rồi mới in
        printWindow.onload = () => {
          printWindow.print();
        };
        
        // Auto cleanup sau 30 giây
        setTimeout(() => {
          URL.revokeObjectURL(pdfBlobUrl);
        }, 30000);
        
        return true;
      } else {
        // Fallback: tải file PDF về máy nếu không thể mở cửa sổ mới
        this.downloadPdf(base64Data, fileName);
        return true;
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      return false;
    }
  }

  /**
   * Tải PDF từ base64 data
   * @param base64Data - Chuỗi base64 của PDF
   * @param fileName - Tên file (không bao gồm extension)
   * @returns boolean - true nếu thành công
   */
  static downloadPdf(base64Data: string, fileName: string = "document"): boolean {
    if (!base64Data) {
      console.error("No PDF data provided");
      return false;
    }

    try {
      const pdfBlobUrl = this.createPdfBlobUrl(base64Data);
      
      if (!pdfBlobUrl) {
        throw new Error("Failed to create PDF blob URL");
      }

      // Tạo link và trigger download
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `${fileName}.pdf`;
      
      // Add to DOM, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(pdfBlobUrl), 100);
      
      return true;
    } catch (error) {
      console.error("Error downloading PDF:", error);
      return false;
    }
  }

  /**
   * Mở PDF trong tab mới để xem
   * @param base64Data - Chuỗi base64 của PDF
   * @returns string - Blob URL hoặc empty string nếu có lỗi
   */
  static viewPdf(base64Data: string): string {
    if (!base64Data) {
      console.error("No PDF data provided");
      return "";
    }

    try {
      const pdfBlobUrl = this.createPdfBlobUrl(base64Data);
      
      if (pdfBlobUrl) {
        window.open(pdfBlobUrl, '_blank');
        return pdfBlobUrl;
      }
      
      return "";
    } catch (error) {
      console.error("Error viewing PDF:", error);
      return "";
    }
  }

  /**
   * Validate base64 PDF data
   * @param base64Data - Chuỗi base64 cần validate
   * @returns boolean - true nếu valid
   */
  static validatePdfData(base64Data: string): boolean {
    if (!base64Data || typeof base64Data !== 'string') {
      return false;
    }

    try {
      // Loại bỏ data URL prefix nếu có
      const cleanBase64 = base64Data.replace(
        /^data:application\/pdf;base64,/,
        ""
      );

      // Kiểm tra format base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleanBase64)) {
        return false;
      }

      // Thử decode để kiểm tra
      atob(cleanBase64);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up blob URL
   * @param blobUrl - Blob URL cần clean up
   */
  static cleanupBlobUrl(blobUrl: string): void {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}

export default PdfHandler;