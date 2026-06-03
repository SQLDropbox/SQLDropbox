using brevo_csharp.Api;
using brevo_csharp.Model;

namespace SQLDropbox.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
            brevo_csharp.Client.Configuration.Default.ApiKey["api-key"] = _config["Brevo:ApiKey"];
        }

        public async System.Threading.Tasks.Task SendEmailAsync(string toEmail, string toName, string subject, string htmlContent)
        {
            Console.WriteLine($"API Key: {_config["Brevo:ApiKey"]?.Substring(0, 15)}...");
            Console.WriteLine($"Sender: {_config["Brevo:SenderEmail"]}");
            Console.WriteLine($"To: {toEmail}");

            var apiInstance = new TransactionalEmailsApi();

            var sendSmtpEmail = new SendSmtpEmail(
                sender: new SendSmtpEmailSender(
                    name: _config["Brevo:SenderName"],
                    email: _config["Brevo:SenderEmail"]
                ),
                to: new List<SendSmtpEmailTo>
                {
                new SendSmtpEmailTo(email: toEmail, name: toName)
                },
                subject: subject,
                htmlContent: htmlContent
            );

            await apiInstance.SendTransacEmailAsync(sendSmtpEmail);
        }
    }
}
