using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("Schema")]
    public class Schema
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SchemaId { get; set; }
        public string SchemaName { get; set; } = null!;

        [JsonIgnore]
        public ICollection<Chapter> Chapters { get; set; } = [];

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
