using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;
using System.Security.Cryptography;
using System.Text;

namespace SQLDropbox.Services
{
    public class RefreshTokenService
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _db;
        private readonly int _refreshTokenDays;

        public RefreshTokenService(IConfiguration configuration, AppDbContext db)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _refreshTokenDays = int.Parse(_configuration["Jwt:RefreshTokenDays"]
                ?? throw new InvalidOperationException("Jwt Refresh Token Days is not configured"));
            _db = db;
        }

        private static string HashToken(string token)
        {
            return Convert.ToBase64String(SHA512.HashData(Encoding.UTF8.GetBytes(token)));
        }

        public string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        public async Task<RefreshToken> CreateRefreshToken(User user, string ipAddress, string token)
        {
            string tokenHash = HashToken(token);

            RefreshToken refreshTokenToCreate = new()
            {
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenDays),
                IsRevoked = false,
                User = user
            };

            _db.RefreshTokens
                .Include(rt => rt.User)
                .Where(rt => rt.User.UserId == user.UserId)
                .ExecuteDelete();

            var entity = _db.RefreshTokens.Add(refreshTokenToCreate);
            await _db.SaveChangesAsync();
            return entity.Entity;
        }

        public async Task<RefreshToken?> ValidateRefreshToken(string refreshToken)
        {
            string tokenHash = HashToken(refreshToken);
            return await _db.RefreshTokens
                .Include(rt => rt.User)
                .Where(rt => rt.TokenHash == tokenHash && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();
        }

        public async Task RevokeRefreshToken(RefreshToken refreshTokenToRevoke)
        {
            _db.RefreshTokens
                .Where(rt => rt.RefreshTokenId == refreshTokenToRevoke.RefreshTokenId)
                .ExecuteDelete();
            await _db.SaveChangesAsync();
        }
    }
}
