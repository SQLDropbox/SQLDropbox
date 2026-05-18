namespace SQLDropbox.DTO
{
    public class CourseDTO
    {
        public string? CourseId { get; set; }
        public string? CourseNameEN { get; set; }
        public string? CourseNameNL { get; set; }
        public string? CourseDescriptionEN { get; set; }
        public string? CourseDescriptionNL { get; set; }
        public string? Lecturer { get; set; }
        public DateTime? Deadline { get; set; }
        public bool IsActive { get; set; }
    }
}
