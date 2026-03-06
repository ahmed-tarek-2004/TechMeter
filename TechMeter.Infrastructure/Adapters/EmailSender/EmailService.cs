using FluentEmail.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;

namespace TechMeter.Infrastructure.Adapters.EmailSender
{
    public class EmailService : IEmailService
    {
        private readonly IFluentEmail _fluentEmail;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<EmailService> _logger;
        public EmailService(IFluentEmail fluentEmail, UserManager<User> userManager, ILogger<EmailService> logger)
        {
            _fluentEmail = fluentEmail;
            _userManager = userManager;
            _logger = logger;
        }
        public async Task SendOtpEmailAsync(User user, string otp)
        {
            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                var templatePath = Path.Combine(rootPath, "wwwroot", "EmailTemplates", "OtpVerificationEmail.html");

                if (!System.IO.File.Exists(templatePath))
                {
                    _logger.LogError($"OTP Email Template not found at path: {templatePath}");
                    throw new FileNotFoundException("OTP Email Template not found.", templatePath);
                }

                var emailTemplate = await System.IO.File.ReadAllTextAsync(templatePath);

                emailTemplate = emailTemplate
                    .Replace("{OtpCode}", otp)
                    .Replace("{CurrentYear}", DateTime.UtcNow.Year.ToString())
                    .Replace("{Username}", user.UserName ?? user.Email ?? "User");

                var sendResult = await _fluentEmail
                    .To(user.Email)
                    .Subject("Email Confirmation Code")
                    .Body(emailTemplate, isHtml: true)
                    .SendAsync();

                if (!sendResult.Successful)
                {
                    _logger.LogError($"Failed to send OTP email to {user.Email}. Errors: {string.Join(", ", sendResult.ErrorMessages)}");
                    throw new Exception("Failed to send OTP email.");
                }

                _logger.LogInformation($"OTP email successfully sent to {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while sending OTP email to {user.Email}");
                throw;
            }
        }
        public async Task InvoiceEmailAsync(User user, PaymentTransaction transaction, List<GetCourseResponse> courseResponses)
        {
            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                var templatePath = Path.Combine(rootPath, "wwwroot", "EmailTemplates", "InvoiceEmail.html");

                if (!System.IO.File.Exists(templatePath))
                {
                    _logger.LogError($"Invoice Email Template not found at path: {templatePath}");
                    throw new FileNotFoundException("Invoice Email Template not found.", templatePath);
                }


                var emailTemplate = await System.IO.File.ReadAllTextAsync(templatePath);

                var ReceiptNumber = $"TM-{DateTime.Now.Year}-{transaction.Id:D5}";
                emailTemplate = emailTemplate
                              .Replace("{{ClientName}}", user.UserName)
                              .Replace("{{ClientPhone}}", user.PhoneNumber)
                              .Replace("{{ClientAddress}}", user.Country)
                              .Replace("{{ReceiptNumber}}", ReceiptNumber)
                              .Replace("{{PaymentDate}}", transaction.Date.ToString("dd MMM yyyy"))
                              .Replace("{{OrderID}}", transaction.OrderId)
                              .Replace("{{TransactionID}}", transaction.Id)
                              .Replace("{{Currency}}", "EGP")
                              .Replace("{{Subtotal}}", transaction.TotalPrice.ToString("C"))
                              .Replace("{{Discount}}", "")
                              .Replace("{{TotalAmount}}", courseResponses.Sum(b => b.Price).ToString())
                              .Replace("{{PaymentMethod}}", "card")
                              .Replace("{{VerificationHash}}", GenerateReceiptHash(transaction, user, ReceiptNumber))
                              //.Replace("{{ItemRows}}", BuildCourseRows(courseResponses))
                              .Replace("{{CompanyPhone}}", "+201158905589")
                              .Replace("{{CompanyEmail}}", "TechMeter@gmail.com");

                var sendResult = await _fluentEmail
                    .To(user.Email)
                    .Subject("Invoice Email")
                    .Body(emailTemplate, isHtml: true)
                    .SendAsync();

                if (!sendResult.Successful)
                {
                    _logger.LogError($"Failed to send Invoice email to {user.Email}. Errors: {string.Join(", ", sendResult.ErrorMessages)}");
                    throw new Exception("Failed to send Invoice email.");
                }

                _logger.LogInformation($"Invoice email successfully sent to {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while sending Invoice email to {user.Email}");
                throw;
            }
        }
        private static string GenerateReceiptHash(PaymentTransaction receipt, User user, string ReceiptNumber)
        {
            var data = $"{ReceiptNumber}|{user.UserName}|{receipt.TotalPrice}|{receipt.Date}";

            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(data));
            return "sha256:" + Convert.ToHexString(bytes).ToLower();
        }
        private static string FormatMoney(decimal amount, string currency)
        => $"{currency} {amount:N2}";

        private static string BuildCourseRows(List<GetCourseResponse> courses)
        {
            var sb = new StringBuilder();
            for (int c = 0; c <= courses.Count(); c++)
            {
                sb.AppendLine($"""
                <tr>
                  <td style="color:var(--text-muted); font-family:'Space Mono',monospace">{c + 1:D2}</td>
                  <td>
                    <span class="course-badge">{courses[c].CourseProfileImageUrl}</span>
                    <span class="course-name">{courses[c].Title}</span>
                  </td>
                  <td class="price-cell">{FormatMoney(courses[c].Price, courses[c].Currency)}</td>
                </tr>
            """);
            }
            return sb.ToString();
        }
    }
}
