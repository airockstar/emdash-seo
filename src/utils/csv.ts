const CSV_COLUMNS = [
  "contentId",
  "collection",
  "title",
  "description",
  "ogImage",
  "robots",
  "canonical",
  "focusKeyword",
  "schemaType",
  "breadcrumbLabel",
] as const;

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function overridesToCsv(items: Array<{ id: string; data: Record<string, unknown> }>): string {
  const header = CSV_COLUMNS.join(",");
  const rows = items.map((item) => {
    return CSV_COLUMNS.map((col) => {
      if (col === "contentId") return escapeCsvField(String(item.id ?? ""));
      const val = item.data[col];
      return escapeCsvField(val != null ? String(val) : "");
    }).join(",");
  });
  return [header, ...rows].join("\n");
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export function csvToOverrides(csv: string): Array<{ contentId: string; [key: string]: unknown }> {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const results: Array<{ contentId: string; [key: string]: unknown }> = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const record: Record<string, unknown> = {};
    for (let j = 0; j < header.length; j++) {
      const col = header[j].trim();
      const val = fields[j]?.trim() ?? "";
      if (val) record[col] = val;
    }
    if (record.contentId) {
      results.push(record as { contentId: string; [key: string]: unknown });
    }
  }

  return results;
}
