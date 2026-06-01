using CsvHelper;
using CsvHelper.Configuration;
using SQLDropbox.DTO;
using System.Globalization;
using System.Text;

public class CsvService
{
    public class ParseStudentsResult
    {
        public List<StudentDTO> Students { get; set; } = new();
        public int Skipped { get; set; }
    }

    public async Task<ParseStudentsResult> ParseStudentsAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new Exception("No file provided.");

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            DetectDelimiter = true,
            Encoding = Encoding.UTF8
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, config);

        var rows = new List<string[]>();

        // Read raw rows (so we can keep your dynamic header detection logic)
        while (await csv.ReadAsync())
        {
            rows.Add(csv.Parser.Record ?? Array.Empty<string>());
        }

        if (rows.Count == 0)
            throw new Exception("CSV file is empty.");

        int headerRowIndex = -1;
        Dictionary<string, int> columnMap = new(StringComparer.OrdinalIgnoreCase);

        // Detect header row (same logic as before)
        for (int i = 0; i < Math.Min(rows.Count, 10); i++)
        {
            var cellValues = rows[i]
                .Select(c => c?.Trim() ?? string.Empty)
                .ToList();

            if (cellValues.Any(v =>
                v.Equals("User Id", StringComparison.OrdinalIgnoreCase) ||
                v.Equals("Inlognummer", StringComparison.OrdinalIgnoreCase)))
            {
                headerRowIndex = i;

                for (int col = 0; col < cellValues.Count; col++)
                {
                    if (!string.IsNullOrWhiteSpace(cellValues[col]))
                        columnMap[cellValues[col]] = col;
                }

                break;
            }
        }

        if (headerRowIndex == -1)
            throw new Exception("Could not detect a valid header row. Expected 'User Id' or 'Inlognummer' column.");

        // Determine column names
        string userCodeCol = columnMap.ContainsKey("User Id")
            ? "User Id"
            : "Inlognummer";

        string? lastNameCol = columnMap.ContainsKey("Naam")
            ? "Naam"
            : null;

        string? firstNameCol = columnMap.ContainsKey("Voornaam")
            ? "Voornaam"
            : columnMap.ContainsKey("Voornaam/Roepnaam")
                ? "Voornaam/Roepnaam"
                : null;

        string? emailCol = columnMap.ContainsKey("Email")
            ? "Email"
            : columnMap.ContainsKey("Emailadres")
                ? "Emailadres"
                : null;

        if (emailCol == null)
            throw new Exception("Required columns not found (Email).");

        var result = new ParseStudentsResult();

        // Parse data rows
        for (int i = headerRowIndex + 1; i < rows.Count; i++)
        {
            var row = rows[i]
                .Select(c => c?.Trim() ?? string.Empty)
                .ToList();

            string userCode = GetCell(row, columnMap, userCodeCol);
            string email = GetCell(row, columnMap, emailCol);

            string lastName = lastNameCol != null
                ? GetCell(row, columnMap, lastNameCol)
                : string.Empty;

            string firstName = firstNameCol != null
                ? GetCell(row, columnMap, firstNameCol)
                : string.Empty;

            if (string.IsNullOrWhiteSpace(userCode) ||
                string.IsNullOrWhiteSpace(email))
            {
                result.Skipped++;
                continue;
            }

            result.Students.Add(new StudentDTO
            {
                UserCode = userCode,
                FirstName = firstName,
                LastName = lastName,
                Email = email
            });
        }

        return result;
    }

    private static string GetCell(
        List<string> cells,
        Dictionary<string, int> map,
        string column)
    {
        return map.TryGetValue(column, out int idx) && idx < cells.Count
            ? cells[idx]
            : string.Empty;
    }
}