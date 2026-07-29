using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Services
{
    public interface IMediaUploading
    {
        public Task<string> UploadAsync(IFormFile file);
        public Task<string> UploadVideoAsync(IFormFile file);
    }
}
