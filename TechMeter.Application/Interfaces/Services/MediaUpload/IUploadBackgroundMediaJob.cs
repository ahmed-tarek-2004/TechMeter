using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Services.MediaUpload
{
    public interface IUploadBackgroundMediaJob
    {
        Task UploadLessonImageJob(string Id, string name, string filePath, CancellationToken cancellationToken = default);
        //Task<bool> UploadImageAsync(IFormFile file,string name, CancellationToken cancellationToken = default);
    }
}
