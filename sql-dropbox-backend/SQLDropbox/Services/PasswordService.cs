using SqlParser.Ast;
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
        /// Hashes a password if it is valid (with BCrypt (salt and pepper))
        /// </summary>
        public string HashPasswordIfValid(string password)
        {
            if (string.IsNullOrWhiteSpace(password) ||
               password.Length < 12 ||
               !password.Any(char.IsLower) ||
               !password.Any(char.IsUpper) ||
               !password.Any(char.IsDigit) ||
               !password.Any(c => !char.IsLetterOrDigit(c))
           ) throw new ArgumentException(
               "Password must fullfill the following requirements: " +
               "minimum of 12 characters, " +
               "at least 1 number, " +
               "at least 1 lowercase character, " +
               "at least 1 uppercase character and " +
               "at least 1 special character"
           );

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
