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

        public void AttachCookie(HttpResponse response, string refreshToken, DateTime expiresAt)
        {
            response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = expiresAt,
                Path = "/"
            });
        }

        public void RemoveCookie(HttpResponse response)
        {
            response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/" });
        }

        public async Task<RefreshToken> CreateRefreshToken(User user, string ipAddress, string token)
        {
            string tokenHash = HashToken(token);

            RefreshToken refreshTokenToCreate = new()
            {
                TokenHash = tokenHash,
                CreatedAt = DateTime.Now,
                ExpiresAt = DateTime.Now.AddDays(_refreshTokenDays),
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
                .Where(rt => rt.TokenHash == tokenHash && !rt.IsRevoked && rt.ExpiresAt > DateTime.Now)
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
