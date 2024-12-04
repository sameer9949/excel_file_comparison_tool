using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using ExcelComparisonApi.Models;

namespace ExcelComparisonApi.Services
{
    public interface IExcelComparisonService
    {
        Task<byte[]> CompareAndGenerateExcel(Stream oldFileStream, Stream newFileStream);
        IEnumerable<string> ReadLinesEfficiently(Stream fileStream);
    }
}