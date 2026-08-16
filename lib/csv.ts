/** 轻量 CSV 解析（支持双引号转义），返回对象数组，数值自动转 number。*/

export function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const header = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const obj: Record<string, unknown> = {};
    header.forEach((h, i) => {
      const raw = cells[i] ?? "";
      obj[h] = /^\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
    });
    return obj;
  });
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
