using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Application.Interfaces.Jobs
{
    public interface IBackgroundJobService
    {
        string Enqueue(Expression<Action> methodCall);
        
        string Enqueue<T>(Expression<Action<T>> methodCall);
    
        string Schedule<T>(Expression<Action<T>> methodCall,TimeSpan delay);
    }
}
