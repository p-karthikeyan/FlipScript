import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { Book } from '@/store/useBookStore';

function wrapWords({
  text,
  font,
  fontSize,
  maxWidth,
}: {
  text: string;
  font: PDFFont;
  fontSize: number;
  maxWidth: number;
}): string[] {
  // Split into paragraphs; keep explicit newlines as separate blocks.
  const paragraphs = text.split(/\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().length ? paragraph.split(/\s+/) : [''];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine.length ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);
      if (width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
  }

  return lines;
}

async function embedFont(doc: PDFDocument): Promise<PDFFont> {
  return doc.embedFont(StandardFonts.Helvetica);
}

export async function downloadBookAsPdf(book: Book) {
  const pdfDoc = await PDFDocument.create();
  const font = await embedFont(pdfDoc);

  // A4 points: 595.28 x 841.89
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 56;
  const marginTop = 72;
  const marginBottom = 56;

  const fontSize = 12;
  const lineHeight = 16;
  const maxWidth = pageWidth - marginX * 2;

  let firstPdfPage = true;

  for (const p of book.pages) {
    if (firstPdfPage) {
      pdfDoc.addPage([pageWidth, pageHeight]);
      firstPdfPage = false;
    } else {
      pdfDoc.addPage([pageWidth, pageHeight]);
    }
    const page = pdfDoc.getPages()[pdfDoc.getPages().length - 1];

    // Header (book title + page number)
    const idx = book.pages.findIndex((x) => x.id === p.id);
    const pageNum = idx + 1;
    page.drawText(book.title || 'Untitled Book', {
      x: marginX,
      y: pageHeight - 44,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Page ${pageNum}`, {
      x: pageWidth - marginX - 80,
      y: pageHeight - 44,
      size: 11,
      color: rgb(0.2, 0.2, 0.2),
    });

    const lines = wrapWords({
      text: p.content || '',
      font,
      fontSize,
      maxWidth,
    });

    let y = pageHeight - marginTop;
    for (const line of lines) {
      if (y < marginBottom) break;
      page.drawText(line, {
        x: marginX,
        y,
        size: fontSize,
        color: rgb(0.1, 0.07, 0.04),
      });
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  // `pdf-lib` returns a `Uint8Array`; type definitions for `BlobPart` can be stricter
  // than what TS infers from `Uint8Array`, so we convert to a byte-accurate `ArrayBuffer`.
  const pdfArrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const safeTitle = (book.title || 'Untitled Book').replace(/[^\w\- ]+/g, '').trim() || 'StoryWriter';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

