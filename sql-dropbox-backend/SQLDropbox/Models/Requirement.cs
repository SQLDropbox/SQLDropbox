using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Requirement")]
    public class Requirement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RequirementId { get; set; }
        public required string Statement { get; set; }
        public bool Use { get; set; } = false;

        [JsonIgnore]
        public Exercise Exercise { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
    }
}
