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
            brevo_csharp.Client.Configuration.Default.ApiKey["api-key"] = _config["Brevo:ApiKey"] ?? throw new Exception("ApiKey is not configured.");
        }

        public async System.Threading.Tasks.Task SendEmailAsync(string toEmail, string toName, string subject, string htmlContent)
        {
            var apiInstance = new TransactionalEmailsApi();

            var sendSmtpEmail = new SendSmtpEmail(
                sender: new SendSmtpEmailSender(
                    name: _config["Brevo:SenderName"] ?? throw new Exception("SenderName is not configured."),
                    email: _config["Brevo:SenderEmail"] ?? throw new Exception("SenderEmail is not configured.")
                ),
                to:
                [new SendSmtpEmailTo(email: toEmail, name: toName)],
                subject: subject,
                htmlContent: htmlContent,
                replyTo: new SendSmtpEmailReplyTo(
                    email: _config["Brevo:ReplyToEmail"] ?? throw new Exception("ReplyToEmail is not configured."),
                    name: _config["Brevo:ReplyToName"] ?? throw new Exception("ReplyToName is not configured.")
                )
            );

            await apiInstance.SendTransacEmailAsync(sendSmtpEmail);
        }
    }
}
