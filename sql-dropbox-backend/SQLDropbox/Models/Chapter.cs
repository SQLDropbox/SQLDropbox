using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    public enum DbSchemaType
    {
        Animals,
        Countries
    }

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
        public DbSchemaType? DbSchema { get; set; }
        public int? AmountOfExercises { get; set; }

        [JsonIgnore]
        public Course Course { get; set; } = null!;
        public ICollection<Exercise> Exercises { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

    }
}