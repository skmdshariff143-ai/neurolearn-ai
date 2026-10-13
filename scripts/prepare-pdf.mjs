import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("public", {recursive:true});
copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", "public/pdf.worker.min.mjs");
copyFileSync("node_modules/pdfjs-dist/LICENSE", "public/pdfjs-LICENSE.txt");
