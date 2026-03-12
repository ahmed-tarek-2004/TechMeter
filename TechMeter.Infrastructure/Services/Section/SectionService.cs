using Azure.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.DTO.Course;
using TechMeter.Application.DTO.Section;
using TechMeter.Application.Interfaces.SectionService;
using TechMeter.Domain.Models;
using TechMeter.Domain.Models.Auth.Users;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;
using static System.Collections.Specialized.BitVector32;

namespace TechMeter.Infrastructure.Services.SectionService
{
    public class SectionService : ISectionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;

        public SectionService(ApplicationDbContext context, ResponseHandler responseHandler)
        {
            _context = context;
            _responseHandler = responseHandler;
        }
        public async Task<Response<AddSectionResponse>> AddSectionAsync(string providerId, AddSectionRequest request)
        {
            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<AddSectionResponse>("Provider Is Not Found");
            }

            var course = await _context.Course.FirstOrDefaultAsync(b => b.Id == request.courseId && b.ProviderId == providerId);
            if (course == null)
            {
                return _responseHandler.NotFound<AddSectionResponse>("Course Is Not Found");
            }
            var isExists = await _context.Section.AnyAsync(b => b.Name == request.SectionName);
            if (isExists)
            {
                return _responseHandler.BadRequest<AddSectionResponse>("Section Name Is Exsists");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var Section = new Sections()
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = request.SectionName,
                    CourseId = request.courseId
                };
                course.SectionCount += 1;
                await _context.AddAsync(Section);
                await _context.SaveChangesAsync();

                var response = new AddSectionResponse
                {
                    SectionId = Section.Id,
                    SectionName = Section.Name,
                };

                await transaction.CommitAsync();
                return _responseHandler.Created(response, "Section is Created Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<AddSectionResponse>(ex.Message);
            }

        }

        public async Task<Response<string>> DeleteSectionByIdAsync(string providerId, string courseId, string sectionId)
        {
            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<string>("Provider Is Not Found");
            }

            var course = await _context.Course.FirstOrDefaultAsync(b => b.Id == courseId && b.ProviderId == providerId);
            if (course == null)
            {
                return _responseHandler.NotFound<string>("Course Is Not Found");
            }
            var section = await _context.Section.FirstOrDefaultAsync(b => b.Id == sectionId && b.CourseId == courseId);
            if (section == null)
            {
                return _responseHandler.NotFound<string>("Section is not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                course.SectionCount -= 1;
                _context.Remove(section);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return _responseHandler.Success("", "Section is Deleted Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<string>(ex.Message);
            }
        }

        public async Task<Response<GetSectionResponse>> EditSectionAsync(string providerId, string Id, EditSectionRequest request)
        {
            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == providerId);
            if (provider == null)
            {
                return _responseHandler.BadRequest<GetSectionResponse>("Provider Is Not Found");
            }

            var Newcourse = await _context.Course.FirstOrDefaultAsync(b => b.Id == request.CourseId && b.ProviderId == providerId);
            if (Newcourse == null)
            {
                return _responseHandler.NotFound<GetSectionResponse>("NewCourse Is Not Found");
            }
            var section = await _context.Section.FirstOrDefaultAsync(b => b.Id == Id && b.Course.ProviderId == providerId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetSectionResponse>("Section is not found");
            }
            var isExists = await _context.Section.AnyAsync(b => b.Name == request.Name);
            if (isExists)
            {
                return _responseHandler.BadRequest<GetSectionResponse>("Section Name Is Exsists");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                section.Name = request.Name;
                section.CourseId = request.CourseId;

                await _context.SaveChangesAsync();
                var response = new GetSectionResponse
                {
                    Id = section.Id,
                    Name = request.Name,
                    courseId = section.CourseId
                };

                await transaction.CommitAsync();
                return _responseHandler.Success(response, "Section is Edited Successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return _responseHandler.InternalServerError<GetSectionResponse>(ex.Message);
            }

        }

        public async Task<Response<List<GetSectionResponse>>> GetAllCourseSectionsAsync(string userId, string courseId)
        {
            var Sections = await _context.Section.AsNoTracking().Where(b => b.CourseId == courseId && b.Course.ProviderId == userId).Select(b => new GetSectionResponse
            {
                Id = b.Id,
                Name = b.Name,
                courseId = b.CourseId,
            }).ToListAsync();

            return _responseHandler.Success(Sections, "Sections returned successfully");
        }

        public async Task<Response<GetSectionResponse>> GetSectionByIdAsync(string responsiable, string courseId, string sectionId)
        {

            var provider = await _context.Provider.FirstOrDefaultAsync(b => b.Id == responsiable);
            if (provider == null)
            {
                return _responseHandler.BadRequest<GetSectionResponse>("Provider Is Not Found");
            }

            var course = await _context.Course.FirstOrDefaultAsync(b => b.Id == courseId);
            if (course == null)
            {
                return _responseHandler.NotFound<GetSectionResponse>("Course Is Not Found");
            }
            var section = await _context.Section.FirstOrDefaultAsync(b => b.Id == sectionId && b.CourseId == courseId);
            if (section == null)
            {
                return _responseHandler.NotFound<GetSectionResponse>("Section is not found");
            }

            var response = new GetSectionResponse
            {
                courseId = courseId,
                Id = section.Id,
                Name = section.Name,
            };
            return _responseHandler.Success(response, "Sections retuned successfully");
        }
    }
}
