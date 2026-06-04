namespace SQLDropbox.DTO;

public class ExerciseDTO
{
    public string? QuestionNL { get; set; }
    public string? QuestionEN { get; set; }
    public string? HintNL { get; set; }
    public string? HintEN { get; set; }
    public required string SolutionQuery { get; set; }
    public required int QueryAction { get; set; }
    public required int ChapterId { get; set; }
    public List<RequirementDTO> Requirements { get; set; } = [];
}