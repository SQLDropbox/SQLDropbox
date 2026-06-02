namespace SQLDropbox.DTO
{
    public class ChapterDTO
    {
        public string ChapterNameNL { get; set; }
        public string ChapterNameEN { get; set; }
        public string ChapterDescriptionNL { get; set; }
        public string ChapterDescriptionEN { get; set; }
        public int AmountOfExercises { get; set; }
        public int SchemaId { get; set; } = 2;
        public string? SchemaName { get; set; }
        public DateTime? StartDate { get; set; }
    }
}