using System;

namespace ExcelComparisonApi.Models
{
    public class ComparisonResult
    {
        public string Key { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string ChangeType { get; set; }
    }
}