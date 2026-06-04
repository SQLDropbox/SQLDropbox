namespace SQLDropbox.DTO
{
    public class RequirementDTO
    {
        public required string Statement { get; set; }
        public bool IsBlacklist { get; set; } = false;
        public bool IsHidden { get; set; } = false;
        public required int ExerciseId { get; set; }
    }
}