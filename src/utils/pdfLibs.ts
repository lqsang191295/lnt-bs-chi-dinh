import { IPDFItem } from "@/model/ipdf";
import fontkit from "@pdf-lib/fontkit";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Load font từ web hỗ trợ tiếng Việt
 */
const loadVietnameseWebFont = async (pdfDoc: PDFDocument) => {
  try {
    // Register fontkit để hỗ trợ font custom
    pdfDoc.registerFontkit(fontkit);

    // Simplified font loading - chỉ thử 1-2 font để tránh lỗi
    const fontUrls = [
      // Chỉ thử Roboto
      "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
    ];

    for (const fontUrl of fontUrls) {
      try {
        // console.log(`Trying to load font from: ${fontUrl}`);

        // Thêm timeout để tránh hang
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch(fontUrl, {
          signal: controller.signal,
          mode: "cors",
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const fontBytes = await response.arrayBuffer();
          const font = await pdfDoc.embedFont(fontBytes);
          // console.log(`Successfully loaded font from: ${fontUrl}`);
          return { font, supportsVietnamese: true };
        }
      } catch {
        // console.log(`Failed to load font from ${fontUrl}:`, error);
        continue;
      }
    }

    // Fallback ngay lập tức nếu không load được
    // console.log('Using fallback font');
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    return { font, supportsVietnamese: false };
  } catch {
    // console.error('Error loading Vietnamese web font:', error);

    // Fallback cuối cùng
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    return { font, supportsVietnamese: false };
  }
};

/**
 * Normalize text để loại bỏ dấu tiếng Việt
 */
const normalizeVietnameseText = (text: string): string => {
  const vietnameseMap: { [key: string]: string } = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    // Uppercase
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return text.replace(
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g,
    (char) => vietnameseMap[char] || char
  );
};
/**
 * Convert Uint8Array to base64 - Alternative safer method
 */
const arrayBufferToBase64Alternative = (buffer: Uint8Array): string => {
  // Convert to regular array first
  const bytes = Array.from(buffer);

  // Convert in chunks to avoid call stack issues
  const chunkSize = 0x8000; // 32KB chunks
  let result = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    result += String.fromCharCode(...chunk);
  }

  return btoa(result);
};

/**
 * Thêm watermark vào page - Đơn giản hóa để tránh lỗi
 */
import type { PDFFont, PDFPage } from "pdf-lib";

const addWatermarkToPage = (
  page: PDFPage,
  watermarkText: string,
  font: PDFFont
) => {
  try {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) / 25; // Giảm kích thước font

    const centerX = width / 2;
    const centerY = height / 2;

    // Sử dụng text đã normalize để tránh lỗi encoding
    const displayText = normalizeVietnameseText(watermarkText);
    const lines = displayText.split("\n");

    // Chỉ vẽ watermark chính ở giữa
    lines.forEach((line, index) => {
      const yOffset = (index - (lines.length - 1) / 2) * fontSize * 3; // Căn giữa các dòng

      try {
        page.drawText(line, {
          x: centerX - line.length * fontSize * 0.25, // Đơn giản hóa tính toán
          y: centerY + yOffset,
          size: fontSize,
          font: font,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.3,
          // Bỏ rotate để tránh lỗi
          rotate: degrees(45),
        });
      } catch {
        // console.error('Error drawing line:', lineError);
      }
    });
  } catch {
    // console.error('Error adding watermark:', error);

    // Fallback đơn giản nhất
    try {
      const simpleText = "HO SO BENH AN";
      const { width, height } = page.getSize();

      page.drawText(simpleText, {
        x: width / 2 - 60,
        y: height / 2,
        size: 12,
        font: font,
        color: rgb(0.8, 0.8, 1),
        opacity: 0.3,
      });
    } catch {
      // console.error('Even fallback watermark failed:', fallbackError);
    }
  }
};
/**
 * Convert Uint8Array to base64 without causing stack overflow - FIXED VERSION
 */
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = "";
  const chunkSize = 8192;

  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
};
/**
 * Merge PDFs với progress - Fixed stack overflow issue
 */
export const mergePDFsWithProgress = async (
  pdfList: IPDFItem[],
  watermarkText: string = "HO SO BENH AN",
  showDateTime: boolean = true,
  onProgress?: (current: number, total: number, currentHSBA: string) => void
): Promise<string> => {
  try {
    // console.log(`Starting merge for ${pdfList.length} PDFs`);

    const mergedPdf = await PDFDocument.create();

    // Load font với timeout
    let font;

    try {
      const fontResult = await Promise.race([
        loadVietnameseWebFont(mergedPdf),
        new Promise<{
          font: import("pdf-lib").PDFFont;
          supportsVietnamese: boolean;
        }>((_, reject) =>
          setTimeout(() => reject(new Error("Font loading timeout")), 15000)
        ),
      ]);
      font = fontResult.font;
    } catch {
      // console.log('Font loading failed, using Helvetica:', error);
      font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    }

    const total = pdfList.length;

    // Tạo watermark text với ngày giờ
    const currentDateTime = new Date().toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const fullWatermarkText = showDateTime
      ? `${watermarkText}\n${currentDateTime}`
      : watermarkText;

    // Process PDFs one by one
    for (let i = 0; i < pdfList.length; i++) {
      const item = pdfList[i];

      // console.log(`Processing ${i + 1}/${total}: ${item.maHSBA}`);
      onProgress?.(i + 1, total, item.maHSBA);

      try {
        const cleanBase64 = item.FilePdf.replace(
          /^data:application\/pdf;base64,/,
          ""
        );

        // Validate base64
        if (!cleanBase64 || cleanBase64.length === 0) {
          // console.error(`Empty PDF data for ${item.maHSBA}`);
          continue;
        }

        const pdfBytes = Uint8Array.from(atob(cleanBase64), (c) =>
          c.charCodeAt(0)
        );
        const pdf = await PDFDocument.load(pdfBytes);

        const pageIndices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

        copiedPages.forEach((page) => {
          try {
            mergedPdf.addPage(page);
            addWatermarkToPage(page, fullWatermarkText, font);
          } catch {
            // console.error(`Error processing page ${pageIndex} of ${item.maHSBA}:`, pageError);
          }
        });

        // console.log(`Successfully processed ${pageIndices.length} pages from ${item.maHSBA}`);
      } catch {
        // console.error(`Error processing PDF ${i + 1}/${total} (${item.maHSBA}):`, error);
        continue;
      }
    }

    // console.log('Saving merged PDF...');
    const pdfBytes = await mergedPdf.save();

    // console.log('Converting to base64...');

    // Try the alternative method first
    try {
      const base64String = arrayBufferToBase64Alternative(pdfBytes);
      // console.log(`Successfully merged ${pdfList.length} PDFs with alternative method`);
      return base64String;
    } catch {
      // console.error('Alternative base64 conversion failed, trying fallback:', error);

      // Fallback to original method
      const base64String = arrayBufferToBase64(pdfBytes);
      // console.log(`Successfully merged ${pdfList.length} PDFs with fallback method`);
      return base64String;
    }
  } catch (error) {
    // console.error('Error in mergePDFsWithProgress:', error);
    throw new Error(
      `Failed to merge PDFs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Export backward compatibility
export const mergePDFsFromBase64 = mergePDFsWithProgress;
