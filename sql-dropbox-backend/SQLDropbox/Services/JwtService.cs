using Microsoft.IdentityModel.Tokens;
using SQLDropbox.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SQLDropbox.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly RsaSecurityKey _privateKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenDays;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration
                ?? throw new ArgumentNullException(nameof(configuration));
            _issuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt Issuer is not configured");
            _audience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt Audience is not configured");
            _accessTokenDays = int.Parse(_configuration["Jwt:AccessTokenDays"]
                ?? throw new InvalidOperationException("Jwt AccessTokenDays is not configured"));

            var privateKeyPem = File.ReadAllText(configuration["Jwt:PrivateKeyPath"]
                ?? throw new InvalidOperationException("Jwt PrivateKeyPath is not configured"));

            var rsa = RSA.Create();
            rsa.ImportFromPem(privateKeyPem);
            _privateKey = new RsaSecurityKey(rsa);
        }

        public string GenerateAccessToken(Guid userId, string? userCode, string? firstName, string? lastName, Role role)
        {
            SigningCredentials creds = new(_privateKey, SecurityAlgorithms.RsaSha256);

            Claim[] claims =
            [
                new Claim("id", userId.ToString()),
                new Claim("code", userCode ?? ""),
                new Claim("firstName", firstName ?? ""),
                new Claim("lastName", lastName ?? ""),
                new Claim(ClaimTypes.Role, role.ToString())
            ];

            JwtSecurityToken token = new(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(_accessTokenDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    } 
}
