export interface ComparisonResult {
  key: string;
  oldValue?: string;
  newValue?: string;
  changeType: 'added' | 'modified' | 'removed';
}

export interface ExcelRow {
  key: string;
  value: string;
}