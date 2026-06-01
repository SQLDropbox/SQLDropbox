namespace SQLDropbox.DTO
{
    public class RequirementDTO
    {
        public required string Statement { get; set; }
        public required bool Use { get; set; }
        public required int ExerciseId { get; set; }
    }
}