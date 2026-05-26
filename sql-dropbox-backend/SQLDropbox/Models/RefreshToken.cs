using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SQLDropbox.Models
{
    [Table("RefreshToken")]
    public class RefreshToken
    {
        public Guid RefreshTokenId { get; set; }
        public required string TokenHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }

        [JsonIgnore]
        public User User { get; set; } = null!;
    }
}
