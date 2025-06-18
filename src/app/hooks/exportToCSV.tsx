import { Sense, WordWithSenses } from "../../../types/WordSensesList";

type ExportOptions = {
  addRowNumber?: boolean;
};

type CSVResult = {
  csvContent: string;
  previewRows: string[]; // プレビュー用
};

export const generateCSV = (
  words: WordWithSenses[],
  headers: string[],
  options: ExportOptions = {}
): CSVResult => {
  const headerMap: { [key: string]: keyof Sense | "word" } = {
    単語: "word",
    品詞: "pos",
    英語定義: "en",
    日本語訳: "ja",
    "例文(英語)": "seEn",
    "例文(日本語)": "seJa",
  };

  const sanitize = (text: string) => {
    const sanitized = text.replace(/"/g, '""');
    return `"${sanitized}"`;
  };

  const csvHeaders =
    (options.addRowNumber ? sanitize("番号") + "," : "") +
    headers.map((h) => sanitize(h)).join(",");

  const rows = words.map((w, i) => {
    const s = w.senses[0];
    const row = headers.map((h) => {
      const key = headerMap[h];
      const value = key === "word" ? w.word : s?.[key] ?? "";
      return sanitize(String(value));
    });
    return options.addRowNumber ? `${i + 1},${row.join(",")}` : row.join(",");
  });

  const allRows = [csvHeaders, ...rows];
  return {
    csvContent: allRows.join("\n"),
    previewRows: allRows.slice(0, 4), // ヘッダー＋3行
  };
};

export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", fileName);
  a.click();
};
