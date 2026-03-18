using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.DTO.Auth.Register
{
    public class ProviderRegisterResponse()
    {
       public string Id { get; set; }
       public string UserName { get; set; }
       public string Email {  get; set; }
       public string PhoneNumber {  get; set; }
       public string Country {  get; set; }
       public string? ProfilePhoto {  get; set; }
       public Gender Gender {  get; set; }
       public bool IsEmailConfirmed { get; set; }
       public string BankAccount {  get; set; }
       public string? Brief {  get; set; }
       public string Role {  get; set; }
       public int ExperienceYears {  get; set; }
       public string AccessToken {  get; set; }
       public string RefreshToken {  get; set; }
    }
}
