"use client";

import { memo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// cần config worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfPreviewProps = {
  base64: string;
  onOpen?: () => void;
  interactive?: boolean;
};

function PdfPreview({ base64, interactive = false, onOpen }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);

  // Chuyển base64 thành Uint8Array
  const pdfData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  return (
    <div
      onClick={!interactive ? onOpen : undefined}
      className={`relative w-full h-full ${
        interactive ? "overflow-auto" : "overflow-hidden"
      }`}>
      <Document
        file={{ data: pdfData }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<p>Đang tải PDF...</p>}
        error={<p>Không thể hiển thị PDF</p>}>
        {/* Thumbnail chỉ render trang đầu tiên */}
        {!interactive && <Page pageNumber={1} width={200} />}

        {/* Khi interactive thì render toàn bộ */}
        {interactive &&
          Array.from(new Array(numPages), (_, i) => (
            <Page key={`page_${i + 1}`} pageNumber={i + 1} width={600} />
          ))}
      </Document>

      {/* Overlay nếu không interactive */}
      {!interactive && <div className="absolute inset-0 bg-transparent" />}
    </div>
  );
}

export default memo(PdfPreview);
