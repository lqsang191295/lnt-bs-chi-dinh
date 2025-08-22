"use client";

import { useState, useCallback } from 'react';
import PdfHandler from '@/utils/PdfHandler';

interface iPdfComponentsOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const PdfComponents = (options?: iPdfComponentsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const { onSuccess, onError } = options || {};

  // Print PDF function
  const printPdf = useCallback(async (base64Data: string, fileName?: string) => {
    if (!PdfHandler.validatePdfData(base64Data)) {
      const errorMsg = "Dữ liệu PDF không hợp lệ!";
      onError?.(errorMsg);
      return false;
    }

    setIsLoading(true);
    
    try {
      const success = await PdfHandler.printPdf(base64Data, fileName);

      if (success) {
        onSuccess?.("Đã gửi lệnh in PDF!");
      } else {
        onError?.("Không thể in PDF!");
      }
      
      return success;
    } catch (error) {
      console.error("Print PDF error:", error);
      onError?.("Có lỗi khi in PDF!");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Download PDF function
  const downloadPdf = useCallback((base64Data: string, fileName?: string) => {
    if (!PdfHandler.validatePdfData(base64Data)) {
      const errorMsg = "Dữ liệu PDF không hợp lệ!";
      onError?.(errorMsg);
      return false;
    }

    setIsLoading(true);

    try {
      const success = PdfHandler.downloadPdf(base64Data, fileName);

      if (success) {
        onSuccess?.("Đã tải file PDF thành công!");
      } else {
        onError?.("Không thể tải PDF!");
      }
      
      return success;
    } catch (error) {
      console.error("Download PDF error:", error);
      onError?.("Có lỗi khi tải PDF!");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Create PDF URL for viewing
  const createPdfUrl = useCallback((base64Data: string) => {
    if (!PdfHandler.validatePdfData(base64Data)) {
      onError?.("Dữ liệu PDF không hợp lệ!");
      return "";
    }

    try {
      // Clean up previous URL
      if (pdfUrl) {
        PdfHandler.cleanupBlobUrl(pdfUrl);
      }

      const newUrl = PdfHandler.createPdfBlobUrl(base64Data);
      setPdfUrl(newUrl);
      return newUrl;
    } catch (error) {
      console.error("Create PDF URL error:", error);
      onError?.("Có lỗi khi tạo PDF URL!");
      return "";
    }
  }, [pdfUrl, onError]);

  // View PDF in new tab
  const viewPdf = useCallback((base64Data: string) => {
    if (!PdfHandler.validatePdfData(base64Data)) {
      onError?.("Dữ liệu PDF không hợp lệ!");
      return "";
    }

    try {
      return PdfHandler.viewPdf(base64Data);
    } catch (error) {
      console.error("View PDF error:", error);
      onError?.("Có lỗi khi xem PDF!");
      return "";
    }
  }, [onError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pdfUrl) {
      PdfHandler.cleanupBlobUrl(pdfUrl);
      setPdfUrl("");
    }
  }, [pdfUrl]);

  return {
    isLoading,
    pdfUrl,
    printPdf,
    downloadPdf,
    createPdfUrl,
    viewPdf,
    cleanup,
  };
};

export default PdfComponents;