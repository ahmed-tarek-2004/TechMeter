using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.DTO.OAuth
{
    public class GetUserInfoResponse
    {
        public string name { get; set; }
        public string email { get; set; }
        public string subjects { get; set; }
        public string picture { get; set; }
        //public DateOnly birthday { get; set; }
    }
}
