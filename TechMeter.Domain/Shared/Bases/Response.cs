using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Shared.Bases
{
    public class Response <T>
    {
        public HttpStatusCode StatusCode { get; set; }
        public string? Message { get; set; }
        public bool Succeeded {  get; set; }
        public List<string>?Errors { get; set; }
        public T Data {  get; set; }
    }
}
