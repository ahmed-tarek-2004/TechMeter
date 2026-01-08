using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces;

namespace TechMeter.Infrastructure.Adapters.Cloudinary
{
    public class CloudinaryImageService :IImageUploading
    {
        private readonly ILogger<CloudinaryImageService> logger;
        private readonly CloudinarySettings _cloudinarySettings;
        private readonly CloudinaryDotNet.Cloudinary _cloudinary; 
        public CloudinaryImageService(IOptions<CloudinarySettings>options,ILogger<CloudinaryImageService> logger)
        {
            this.logger = logger;
            _cloudinarySettings = options.Value?? throw new ArgumentNullException(nameof(options));
            var account = new Account(_cloudinarySettings.CloudName,_cloudinarySettings.ApiKey,_cloudinarySettings.ApiSecret);
            _cloudinary = new CloudinaryDotNet.Cloudinary(account)
            {
                Api = { Secure = true }
            };
        }

        public async Task<string> UploadAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            await using var stream = new MemoryStream();

            await file.CopyToAsync(stream);
            stream.Position = 0;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Invalidate = true,
                Overwrite = true
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result == null)
                throw new Exception("Upload result was null from Cloudinary.");

            if (result.Error != null)
                throw new Exception($"Cloudinary error occurred: {result.Error.Message}");

            return result.Url?.ToString() ?? throw new Exception("Cloudinary returned empty URL.");
        }
    }
}
