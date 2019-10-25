using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace SkyleaseAccess.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            this._configuration = configuration;
        }
        public void SendEmail(string userEmail, string Subject, string Body)
        {
            using (var message = new MailMessage())
            {
                message.From = new MailAddress(_configuration["email"],"SkyleaseAccess System");
                message.To.Add(new MailAddress(userEmail));
                //message.CC.Add(new MailAddress("cc@email.com", "CC Name"));
                //message.Bcc.Add(new MailAddress("bcc@email.com", "BCC Name"));
                message.Subject = Subject;
                message.IsBodyHtml = true;
                message.Body = Body;

                using (var client = new SmtpClient("smtp.gmail.com"))
                {
                    client.Port = 587;
                    client.Credentials = new NetworkCredential(_configuration["email"], _configuration["emailPass"]);
                    client.EnableSsl = true;

                    client.Send(message);
                }
            }
        }
    }
}
