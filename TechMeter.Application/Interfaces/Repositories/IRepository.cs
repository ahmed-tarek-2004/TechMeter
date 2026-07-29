using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Repositories
{
    public interface IRepository<T> where T : class
    {
        Task<T> GetAsync(Expression<Func<T, bool>> expression, string? IncludeProperities = null);
        Task<IQueryable<T>> GetAllAsync(Expression<Func<T, bool>>? expression = null, string? IncludeProperities = null);
        Task<bool>AnyAsync(Expression<Func<T,bool>> expression);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task RemoveAsync(T entity);
        Task RemoveRange(IEnumerable<T> entity);

    }
}
