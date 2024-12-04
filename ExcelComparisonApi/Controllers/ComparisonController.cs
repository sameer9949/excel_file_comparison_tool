using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using ExcelComparisonApi.Services;

namespace ExcelComparisonApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class ComparisonController : ControllerBase
    {
        private readonly IExcelComparisonService _comparisonService;
        private readonly ILogger<ComparisonController> _logger;

        public ComparisonController(IExcelComparisonService comparisonService, ILogger<ComparisonController> logger)
        {
            _comparisonService = comparisonService;
            _logger = logger;
        }

        [HttpPost("generate-excel-create")]
        public async Task<IActionResult> CreateExcel(IFormFile oldfile, IFormFile newfile)
        {
            try
            {
                if (oldfile == null || newfile == null)
                {
                    return BadRequest("Please provide both files for comparison");
                }

                if (oldfile.Length == 0 || newfile.Length == 0)
                {
                    return BadRequest("One or both files are empty");
                }

                // Validate file types
                string[] allowedTypes = {
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel"
                };

                if (!allowedTypes.Contains(oldfile.ContentType) || !allowedTypes.Contains(newfile.ContentType))
                {
                    return BadRequest("Please upload valid Excel files (.xls or .xlsx)");
                }

                using var oldStream = oldfile.OpenReadStream();
                using var newStream = newfile.OpenReadStream();
                
                var fileBytes = await _comparisonService.CompareAndGenerateExcel(oldStream, newStream);
                
                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "ComparisonResult.xlsx"
                );
            }
            catch (ExcelProcessingException ex)
            {
                _logger.LogError(ex, "Excel processing error");
                return BadRequest($"Error processing Excel files: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during comparison");
                return StatusCode(500, "An unexpected error occurred while processing the files");
            }
        }
    }
}