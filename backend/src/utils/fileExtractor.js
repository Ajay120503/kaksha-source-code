// const axios = require("axios");
// const pdfParse = require("pdf-parse");

// async function extractTextFromFile(fileUrl) {
//   if (!fileUrl) return "";

//   const response = await axios.get(fileUrl, {
//     responseType: "arraybuffer",
//   });

//   const buffer = Buffer.from(response.data);

//   const data = await pdfParse(buffer);
//   return data.text?.trim() || "";
// }

// module.exports = { extractTextFromFile };

// -------------------------------------------------

// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");
// const mammoth = require("mammoth");
// const Tesseract = require("tesseract.js");

// async function extractTextFromFile(fileUrl, fileType) {
//   if (!fileUrl || !fileType) return "";

//   const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
//   const buffer = Buffer.from(res.data);

//   // PDF
//   if (fileType.includes("pdf")) {
//     const data = await pdfParse(buffer);
//     return data.text?.trim() || "";
//   }

//   // DOCX
//   if (fileType.includes("word")) {
//     const temp = path.join(__dirname, "temp.docx");
//     fs.writeFileSync(temp, buffer);
//     const result = await mammoth.extractRawText({ path: temp });
//     fs.unlinkSync(temp);
//     return result.value?.trim() || "";
//   }

//   // Image OCR
//   if (fileType.includes("image")) {
//     const temp = path.join(__dirname, "temp.png");
//     fs.writeFileSync(temp, buffer);
//     const result = await Tesseract.recognize(temp, "eng");
//     fs.unlinkSync(temp);
//     return result.data.text?.trim() || "";
//   }

//   return "";
// }

// module.exports = { extractTextFromFile };

// -----------------------------------------------------

const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const textract = require("textract");

async function extractTextFromFile(fileUrl, fileType) {
  if (!fileUrl) return "";

  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer"
  });

  const buffer = Buffer.from(response.data);

  try {

    // PDF
    if (fileType.includes("pdf")) {
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    // DOCX
    if (fileType.includes("word") || fileType.includes("docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    // TXT
    if (fileType.includes("text")) {
      return buffer.toString();
    }

    // Images OCR
    if (fileType.includes("image")) {
      const { data } = await Tesseract.recognize(buffer, "eng");
      return data.text.trim();
    }

    // PPTX / other formats
    return await new Promise((resolve, reject) => {
      textract.fromBufferWithMime(fileType, buffer, (err, text) => {
        if (err) return reject(err);
        resolve(text.trim());
      });
    });

  } catch (err) {
    console.error("Extraction error:", err);
    return "";
  }
}

module.exports = { extractTextFromFile };



