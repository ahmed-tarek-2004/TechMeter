using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Services.MediaUpload
{
    public interface IMediaUploadService
    {
        Task UploadLessonMedia(IFormFile file, string Id, string name, CancellationToken cancellationToken = default);
    }
}
