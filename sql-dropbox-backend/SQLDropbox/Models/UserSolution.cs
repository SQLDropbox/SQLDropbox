using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("UserSolution")]
    public class UserSolution
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserSolutionId { get; set; }

        [Required]
        public required string Query { get; set; }
        public bool IsCorrect { get; set; } = false;
        public string? ErrorMessage { get; set; }

        [JsonIgnore]
        public UserExercise UserExercise { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
