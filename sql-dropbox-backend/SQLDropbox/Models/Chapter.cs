using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Chapter")]
    public class Chapter
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ChapterId { get; set; }
        public string? ChapterNameNL { get; set; }
        public string? ChapterNameEN { get; set; }
        public string? ChapterDescriptionNL { get; set; }
        public string? ChapterDescriptionEN { get; set; }
        public int? AmountOfExercises { get; set; }
        public int? Order { get; set; }
        public DateTime? Deadline { get; set; }

        [JsonIgnore]
        public Course Course { get; set; } = null!;
        public ICollection<Exercise> Exercises { get; set; } = [];
        public Schema Schema { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

    }
}