using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using ExcelComparisonApi.Models;

namespace ExcelComparisonApi.Services
{
    public class ExcelComparisonService : IExcelComparisonService
    {
        public async Task<byte[]> CompareAndGenerateExcel(Stream oldFileStream, Stream newFileStream)
        {
            try
            {
                var oldData = ReadExcelContent(oldFileStream);
                var newData = ReadExcelContent(newFileStream);

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("ComparisonResult");

                // Add headers
                worksheet.Cell(1, 1).Value = "Key";
                worksheet.Cell(1, 2).Value = "Old Value";
                worksheet.Cell(1, 3).Value = "New Value";
                worksheet.Cell(1, 4).Value = "Change Type";

                // Style headers
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

                // Compare and populate data
                int row = 2;
                foreach (var oldItem in oldData)
                {
                    if (newData.TryGetValue(oldItem.Key, out var newValue))
                    {
                        if (!string.Equals(oldItem.Value, newValue, StringComparison.Ordinal))
                        {
                            // Modified items
                            AddComparisonRow(worksheet, row++, oldItem.Key, oldItem.Value, newValue, "Modified", XLColor.LightYellow);
                        }
                        newData.Remove(oldItem.Key);
                    }
                    else
                    {
                        // Removed items
                        AddComparisonRow(worksheet, row++, oldItem.Key, oldItem.Value, null, "Removed", XLColor.LightPink);
                    }
                }

                // Add new items
                foreach (var newItem in newData)
                {
                    AddComparisonRow(worksheet, row++, newItem.Key, null, newItem.Value, "Added", XLColor.LightGreen);
                }

                // Auto-fit columns and add filters
                worksheet.Columns().AdjustToContents();
                worksheet.RangeUsed().SetAutoFilter();

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                throw new ExcelProcessingException("Error processing Excel files", ex);
            }
        }

        private Dictionary<string, string> ReadExcelContent(Stream fileStream)
        {
            var data = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheet(1);
            var range = worksheet.RangeUsed();

            // Get header row to identify columns
            var headerRow = range.FirstRow();
            int keyColumnIndex = -1;
            int valueColumnIndex = -1;

            for (int col = 1; col <= headerRow.CellCount(); col++)
            {
                var headerValue = headerRow.Cell(col).GetString().Trim().ToLower();
                if (headerValue.Contains("key"))
                    keyColumnIndex = col;
                else if (headerValue.Contains("value") || headerValue.Contains("text"))
                    valueColumnIndex = col;
            }

            if (keyColumnIndex == -1 || valueColumnIndex == -1)
            {
                throw new ExcelProcessingException("Could not identify key and value columns in the Excel file");
            }

            // Read data rows
            foreach (var row in range.RowsUsed().Skip(1)) // Skip header row
            {
                var key = row.Cell(keyColumnIndex).GetString().Trim();
                var value = row.Cell(valueColumnIndex).GetString().Trim();

                if (!string.IsNullOrEmpty(key))
                {
                    data[key] = value;
                }
            }

            return data;
        }

        private void AddComparisonRow(IXLWorksheet worksheet, int row, string key, string oldValue, string newValue, string changeType, XLColor color)
        {
            worksheet.Cell(row, 1).Value = key;
            worksheet.Cell(row, 2).Value = oldValue ?? string.Empty;
            worksheet.Cell(row, 3).Value = newValue ?? string.Empty;
            worksheet.Cell(row, 4).Value = changeType;

            var rowStyle = worksheet.Row(row).Style;
            rowStyle.Fill.BackgroundColor = color;
        }
    }

    public class ExcelProcessingException : Exception
    {
        public ExcelProcessingException(string message) : base(message) { }
        public ExcelProcessingException(string message, Exception innerException) : base(message, innerException) { }
    }
}