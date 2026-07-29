using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Repositories;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<T> dbset;

        public Repository(ApplicationDbContext context)
        {
            _context = context;
            dbset = _context.Set<T>();
        }

        public async Task AddAsync(T entity)
        {
            await dbset.AddAsync(entity);
        }

        public async Task<bool> AnyAsync(System.Linq.Expressions.Expression<Func<T, bool>> expression)
        {
            return await dbset.AnyAsync(expression);
        }

        public async Task<IQueryable<T>> GetAllAsync(System.Linq.Expressions.Expression<Func<T, bool>>? expression = null, string? IncludeProperities = null)
        {
            IQueryable<T> query = dbset;
            if (expression is not null)
            {
                query = query.Where(expression);
            }
            return query;
        }

        public async Task<T?> GetAsync(System.Linq.Expressions.Expression<Func<T, bool>>? expression, string? IncludeProperities = null)
        {
            IQueryable<T> query = dbset;
            if (expression is not null)
            {
                query = query.Where(expression);
            }
            if (!string.IsNullOrEmpty(IncludeProperities))
            {
                foreach (var include in IncludeProperities
                   .Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(include);
                }
            }
            return await dbset.Where(expression).FirstOrDefaultAsync();
        }

        public Task RemoveAsync(T entity)
        {
            dbset.Remove(entity);
            return Task.CompletedTask;
        }

        public Task RemoveRange(IEnumerable<T> entity)
        {
            dbset.RemoveRange(entity);
            return Task.CompletedTask;
        }

    }
}
