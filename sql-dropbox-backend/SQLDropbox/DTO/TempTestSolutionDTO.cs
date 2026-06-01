namespace SQLDropbox.DTO;

public class TempTestSolutionDTO
{
    public required Guid UserId { get; set; }
    public required string Query { get; set; }
    public required int ExerciseId { get; set; }
}