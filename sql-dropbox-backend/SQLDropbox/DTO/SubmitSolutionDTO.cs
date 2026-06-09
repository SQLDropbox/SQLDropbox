namespace SQLDropbox.DTO;

public class SubmitSolutionDTO
{
    public int ExerciseId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string? Query { get; set; } = string.Empty;
}