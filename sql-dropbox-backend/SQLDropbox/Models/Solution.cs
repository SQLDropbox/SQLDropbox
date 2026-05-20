using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Solution")]
    public class Solution
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SolutionId { get; set; }
        public required string Query { get; set; }

        [JsonIgnore]
        public Exercise Exercise { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
    }
}
