using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Exercise")]
    public class Exercise
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExerciseId { get; set; }
        public string? QuestionNL { get; set; }
        public string? QuestionEN { get; set; }
        public string? HintNL { get; set; }
        public string? HintEN { get; set; }

        [JsonIgnore]
        public Chapter Chapter { get; set; } = null!;
        public ICollection<Requirement> Requirements { get; set; } = [];
        public ICollection<Solution> Solutions { get; set; } = [];
        public ICollection<StudentExercise> StudentExercises { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}