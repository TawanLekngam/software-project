import pdfToText from "react-pdftotext";

export async function extractPDF(url: string) {
  const pdfBlob = await fetch(url).then((res) => res.blob());
  const text = await pdfToText(pdfBlob);
  return text;
}
