using Microsoft.IdentityModel.Tokens;
using SQLDropbox.Enums;
using SQLDropbox.Models;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace SQLDropbox.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly RsaSecurityKey _privateKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenMinutes;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration
                ?? throw new ArgumentNullException(nameof(configuration));
            _issuer = _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException("Jwt Issuer is not configured");
            _audience = _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException("Jwt Audience is not configured");
            _accessTokenMinutes = int.Parse(_configuration["Jwt:AccessTokenMinutes"]
                ?? throw new InvalidOperationException("Jwt AccessTokenMinutes is not configured"));

            var privateKeyPem = File.ReadAllText(configuration["Jwt:PrivateKeyPath"]
                ?? throw new InvalidOperationException("Jwt PrivateKeyPath is not configured"));

            var rsa = RSA.Create();
            rsa.ImportFromPem(privateKeyPem);
            _privateKey = new RsaSecurityKey(rsa);
        }

        public string GenerateAccessToken(User user)
        {
            SigningCredentials creds = new(_privateKey, SecurityAlgorithms.RsaSha256);

            Claim[] claims =
            [
                new Claim("id", user.UserId.ToString()),
                new Claim("code", user.UserCode ?? ""),
                new Claim("firstName", user.FirstName ?? ""),
                new Claim("lastName", user.LastName ?? ""),
                new Claim(ClaimTypes.Role, user.Role.ToString())
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
