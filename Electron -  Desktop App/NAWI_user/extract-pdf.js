import fs from "fs";
import { PDFParse } from "pdf-parse";

const pdfPath = "./Docs/IMP Questions.pdf";
const outputPath = "./Docs/questions-text.json";

try {
    // Read PDF
    const dataBuffer = fs.readFileSync(pdfPath);

    // Create parser
    const parser = new PDFParse({
        data: dataBuffer
    });

    // Extract text
    const result = await parser.getText();

    // Save extracted text
    const output = {
        source: "IMP Questions.pdf",
        pages: result.total,
        text: result.text
    };

    fs.writeFileSync(
        outputPath,
        JSON.stringify(output, null, 2),
        "utf8"
    );

    console.log("=================================");
    console.log("PDF EXTRACTION SUCCESSFUL");
    console.log("=================================");
    console.log("Source:", output.source);
    console.log("Pages:", output.pages);
    console.log("Characters:", output.text.length);
    console.log("Saved to:", outputPath);

    // Clean up
    await parser.destroy();

} catch (error) {
    console.error("=================================");
    console.error("PDF EXTRACTION FAILED");
    console.error("=================================");
    console.error(error);
}