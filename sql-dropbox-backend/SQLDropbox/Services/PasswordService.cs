using System.Text;

namespace SQLDropbox.Services
{
    public class PasswordService
    {
        private readonly int _salt;
        private readonly IConfiguration _configuration;
        private readonly string _pepper;

        public PasswordService(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _salt = int.Parse(_configuration["Password:Salt"] ?? throw new InvalidOperationException("Salt is not configured"));
            _pepper = _configuration["Password:Pepper"] ?? throw new InvalidOperationException("Pepper is not configured");
        }

        /// <summary>
        /// Hashes a password (with BCrypt (salt and pepper))
        /// </summary>
        public string HashPassword(string password)
        {
            string salt = BCrypt.Net.BCrypt.GenerateSalt(_salt);
            string passwordWithPepper = password + _pepper;
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(passwordWithPepper, salt);
            return hashedPassword;
        }

        /// <summary>
        /// Validates a password
        /// </summary>
        public bool ValidatePassword(string hashedPassword, string password)
        {
            string passwordWithPepper = password + _pepper;
            return BCrypt.Net.BCrypt.Verify(passwordWithPepper, hashedPassword);
        }       
    }
}
