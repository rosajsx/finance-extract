"use server";
import { ExtractRecord } from "@/types";
import { parse } from "csv-parse/sync";

export async function readExtract(formData: FormData) {
  "use server";
  const file = formData.get("extract-file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let content = buffer.toString("utf-8");

  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const headers = parse(content, {
    to_line: 1,
  })[0];

  console.log(headers);
  if (
    !headers.includes("Lançamento") ||
    !headers.includes("Data") ||
    !headers.includes("Categoria") ||
    !headers.includes("Tipo") ||
    !headers.includes("Valor")
  ) {
    throw new Error(
      "Invalid file format. Expected headers: Lançamento, Data, Categoria, Tipo, Valor"
    );
  }

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  });

  return records as ExtractRecord[];
}
