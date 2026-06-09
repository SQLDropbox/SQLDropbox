namespace SQLDropbox.DTO
{
    public class ExerciseUpdateDTO
    {
        public string? QuestionNL { get; set; }
        public string? QuestionEN { get; set; }
        public string? HintNL { get; set; }
        public string? HintEN { get; set; }
        public int? QueryAction { get; set; }
        public string? ValidationQuery { get; set; }
        public string? SolutionQuery { get; set; }
        public List<RequirementDTO> Requirements { get; set; } = [];
    }
}
