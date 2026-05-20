using Microsoft.IdentityModel.Tokens;
using SQLDropbox.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SQLDropbox.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly string _key;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenMinutes;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration
                ?? throw new ArgumentNullException(nameof(configuration));
            _key = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt Key is not configured");
            _issuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt Issuer is not configured");
            _audience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt Audience is not configured");
            _accessTokenMinutes = int.Parse(_configuration["Jwt:AccessTokenDays"]
                ?? throw new InvalidOperationException("Jwt Access Token Days is not configured"));
        }

        public string GenerateAccessToken(Guid userId, Role role)
        {
            SymmetricSecurityKey key = new(
                Encoding.UTF8.GetBytes(_key)
            );

            SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha512);

            Claim[] claims =
            [
                new Claim("id", userId.ToString()),
                new Claim(ClaimTypes.Role, role.ToString())
            ];

            JwtSecurityToken token = new(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_accessTokenMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
