using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Services.MediaUpload;


namespace TechMeter.Infrastructure.Adapters.Cloudinary
{
    public class StoreInDiskService(IWebHostEnvironment webHostEnvironment) : IStoreInDisk
    {
        public async Task<string> StoreFileAsync(IFormFile formFile,CancellationToken cancellationToken)
        {
            var uploadPath = Path.Combine(webHostEnvironment.WebRootPath,"Images");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formFile.FileName)}";

            var filePath = Path.Combine(uploadPath, fileName);

            await using var fileStream = new FileStream(filePath,FileMode.Create);

            await formFile.CopyToAsync(fileStream, cancellationToken);

            return filePath;
        }
        public void DeleteFile(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                return;

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}
