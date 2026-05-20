using System.ComponentModel.DataAnnotations;

namespace SQLDropbox.DTO;

public class ExerciseDTO
{
    public string QuestionNL { get; set; }
    public string QuestionEN { get; set; }
    public string HintNL { get; set; }
    public string HintEN { get; set; }
    public string QueryOutput { get; set; }

    [Required]
    public int ChapterId { get; set; }

    public List<string> SolutionQueries { get; set; } = new List<string>();
}