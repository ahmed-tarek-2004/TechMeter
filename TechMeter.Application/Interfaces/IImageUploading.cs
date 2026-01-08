using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces
{
    public interface IImageUploading
    {
        public Task<string>UploadAsync(IFormFile file);
    }
}
