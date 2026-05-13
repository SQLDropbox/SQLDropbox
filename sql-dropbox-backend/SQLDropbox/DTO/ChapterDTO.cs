using SQLDropbox.Models;

namespace SQLDropbox.DTO;

public class ChapterDTO
{
    public string ChapterNameNL { get; set; }
    public string ChapterNameEN { get; set; }
    public string ChapterDescriptionNL { get; set; }
    public string ChapterDescriptionEN { get; set; }
    public DbSchemaType DbSchema { get; set; }
    public int AmountOfExercises { get; set; }
    public int CourseId { get; set; }
}