using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Domain.Enums;

namespace TechMeter.Application.Helper
{
    public static class MediaExtension
    {
        public static MediaType GetMediaType(string filePath)
        {
            var extension = Path.GetExtension(filePath)
                .ToLowerInvariant();

            return extension switch
            {
                ".jpg" or
                ".jpeg" or
                ".png" or
                ".gif" or
                ".webp" or
                ".bmp" => MediaType.Image,

                ".mp4" or
                ".avi" or
                ".mov" or
                ".mkv" or
                ".webm" => MediaType.Video,

                ".pdf" or
                ".doc" or
                ".docx" or
                ".txt" or
                ".xls" or
                ".xlsx" or
                ".ppt" or
                ".pptx" => MediaType.File,

                _ => MediaType.Unknown
            };
        }
    }
}
