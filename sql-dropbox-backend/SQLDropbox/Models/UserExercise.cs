using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("UserExercise")]
    public class UserExercise
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserExerciseId { get; set; }
        public bool IsCompleted { get; set; } = false;

        [JsonIgnore]
        public Exercise Exercise { get; set; } = null!;
        [JsonIgnore]
        public User User {  set; get; } = null!;
        public ICollection<UserSolution> UserSolutions { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
