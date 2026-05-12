using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("StudentExercise")]
    public class StudentExercise
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StudentExerciseId { get; set; }
        public bool IsCompleted { get; set; }

        [JsonIgnore]
        public Exercise Exercise { get; set; } = null!;
        [JsonIgnore]
        public Student Student {  set; get; } = null!;
        public ICollection<StudentSolution> StudentSolutions { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
