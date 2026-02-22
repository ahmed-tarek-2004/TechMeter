using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Lesson;
using TechMeter.Application.Interfaces;
using TechMeter.Application.Interfaces.Lesson;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Identity;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Services.Lesson
{
    public class LessonService: ILessonService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly ILogger<LessonService> _logger;
        public LessonService(ApplicationDbContext context, ResponseHandler responseHandler,
            ILogger<LessonService> logger)

        {
            _context = context;
            _responseHandler = responseHandler;
            _logger = logger;

        }
        public async Task<Response<GetLessonResponse>> AddLessonAsync(string sectionId,AddLessonRequest request)
        {
            var section = await _context.Section.FindAsync(sectionId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Section is not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Lesson = new TechMeter.Domain.Models.Lessons()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.Name,
                    Description = request.Description,
                    SectionId = sectionId,
                    LessonUrl = request.LessonUrl
                };
                await _context.AddAsync(Lesson);
                await _context.SaveChangesAsync();
                var response = CreateALessonResponse(Lesson);
                await transaction.CommitAsync();
                return _responseHandler.Created(response, $"Lesson {request.Name} Created Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }
        public async Task<Response<GetLessonResponse>> EditLessonAsync(string Id, EditLessonRequest editLessonRequest)
        {
            var Lesson = await _context.Lessons
              .FirstOrDefaultAsync(b => b.Id == Id);

            if (Lesson == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Lesson Not Found");
            }
            var section = await _context.Section.FindAsync(editLessonRequest.SectionId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetLessonResponse>("Section Not Found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Lesson.Description = editLessonRequest.Description;
                Lesson.Name = editLessonRequest.Name;
                Lesson.SectionId = editLessonRequest.SectionId;
                await _context.SaveChangesAsync();

                var response = new GetLessonResponse()
                {
                    Id = Id,
                    LessonUrl = editLessonRequest.LessonUrl,
                    SectionId = editLessonRequest.SectionId,
                    Description = Lesson.Description,
                    Name = Lesson.Name,

                };
                await transaction.CommitAsync();
                return _responseHandler.Success(response, $"Lesson {response.Name} updated successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetLessonResponse>(ex.Message);
            }
        }
        public async Task<Response<List<GetLessonResponse>>> GetALLessonAsync()
        {
            var response = await _context.Lessons.Select(b => new GetLessonResponse()
            {
                Id = b.Id,
                Description = b.Description,
                LessonUrl = b.LessonUrl,
                Name = b.Name,
                SectionId = b.SectionId,
            }).ToListAsync();

            return _responseHandler.Success(response, "Lessons returned successfully");
        }
        public async Task<Response<GetLessonResponse>> GetLessonByIdAsync(string Id)
        {
            var lesson = await _context.Lessons.FirstOrDefaultAsync(b => b.Id == Id);
            if (lesson == null)
                return _responseHandler.NotFound<GetLessonResponse>("Lesson not found");
            var response = CreateALessonResponse(lesson!);
            return _responseHandler.Success(response, "Lesson returned successfully");
        }

        public async Task<Response<List<GetLessonResponse>>> GetSectionLessonResponse(string sectionId)
        {
            if (!await _context.Section.AnyAsync(s => s.Id == sectionId))
                return _responseHandler.NotFound<List<GetLessonResponse>>("Section is not found");

            var lessons = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.SectionId == sectionId)
                .Select(l => new GetLessonResponse
                {
                    SectionId = l.SectionId,
                    Id = l.Id,
                    Description = l.Description,
                    LessonUrl = l.LessonUrl,
                    Name = l.Name
                })
                .ToListAsync();

            return _responseHandler.Success(lessons, "Section lessons returned successfully");
        }
        public async Task<Response<string>> DeleteLessonAsync(string Id)
        {
            var Lesson = await _context.Lessons.FindAsync(Id);
            if (Lesson == null)
            {
                return _responseHandler.NotFound<string>("Lesson Not Found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Remove(Lesson);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Deleted<string>( $"Lesson {Lesson.Name} Deleted Successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        private GetLessonResponse CreateALessonResponse(TechMeter.Domain.Models.Lessons lesson)
        {
            var response = new GetLessonResponse()
            {
                Id = lesson.Id,
                Description = lesson.Description,
                LessonUrl = lesson.LessonUrl,
                Name = lesson.Name,
                SectionId = lesson.SectionId,
            };
            return response;
        }
    }
}
