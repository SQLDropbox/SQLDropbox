using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("StudentSolution")]
    public class StudentSolution
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StudentSolutionId { get; set; }

        [Required]
        public required string Query { get; set; }
        public bool IsCorrect { get; set; }
        public string? Error { get; set; }

        [JsonIgnore]
        public StudentExercise StudentExercise { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
