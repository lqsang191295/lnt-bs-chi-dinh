import { PDFDocument } from "pdf-lib";

function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

export async function signPdf({
  pdfBase64,
  signatureBase64,
  page,
  pdfX,
  pdfY,
  width = 140,
}: {
  pdfBase64: string;
  signatureBase64: string;
  page: number;
  pdfX: number;
  pdfY: number;
  width?: number;
}) {
  const pdfDoc = await PDFDocument.load(
    Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))
  );

  const pngImage = await pdfDoc.embedPng(
    signatureBase64.replace(/^data:image\/png;base64,/, "")
  );

  const pngSize = pngImage.scale(1);
  const ratio = width / pngSize.width;

  const drawWidth = width;
  const drawHeight = pngSize.height * ratio;

  const pdfPage = pdfDoc.getPage(page - 1);

  pdfPage.drawImage(pngImage, {
    x: pdfX,
    y: pdfY - drawHeight,
    width: drawWidth,
    height: drawHeight,
  });

  const signedPdfBytes = await pdfDoc.save();

  return uint8ToBase64(signedPdfBytes);
}
