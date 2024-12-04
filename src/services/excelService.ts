import { ComparisonResult, ExcelRow } from '../types/comparison';

export function sanitizeHtmlTags(text: string): string {
  const tags = [
    '<u>', '</u>', '<b>', '</b>', '<br>', '</br>', '<i>', '</i>',
    '<br />', '<li>', '</li>', '<ul>', '</ul>', '<ol>', '</ol>'
  ];
  return tags.reduce((current, tag) => current.replace(tag, ''), text);
}

export function parseExcelRow(line: string): ExcelRow | null {
  const parts = line.split('=');
  if (parts.length !== 2) return null;

  return {
    key: parts[0].trim().replace('export const', ''),
    value: sanitizeHtmlTags(parts[1].trim())
  };
}

export function compareExcelData(oldData: string[], newData: string[]): ComparisonResult[] {
  const oldMap = new Map<string, string>();
  const results: ComparisonResult[] = [];

  // Parse and store old data
  oldData.forEach(line => {
    const row = parseExcelRow(line);
    if (row) {
      oldMap.set(row.key.toLowerCase(), row.value);
    }
  });

  // Compare with new data
  newData.forEach(line => {
    const row = parseExcelRow(line);
    if (!row) return;

    const oldValue = oldMap.get(row.key.toLowerCase());
    if (!oldValue) {
      results.push({
        key: row.key,
        newValue: row.value,
        changeType: 'added'
      });
    } else if (oldValue !== row.value) {
      results.push({
        key: row.key,
        oldValue,
        newValue: row.value,
        changeType: 'modified'
      });
    }
    oldMap.delete(row.key.toLowerCase());
  });

  // Add removed entries
  oldMap.forEach((value, key) => {
    results.push({
      key,
      oldValue: value,
      changeType: 'removed'
    });
  });

  return results.sort((a, b) => a.key.localeCompare(b.key));
}