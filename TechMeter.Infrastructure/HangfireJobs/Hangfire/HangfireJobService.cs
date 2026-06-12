using Hangfire;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Interfaces.Jobs;

namespace TechMeter.Infrastructure.HangfireJobs
{
    public class HangfireJobService : IBackgroundJobService
    {
        private readonly IBackgroundJobClient _backgroundJobClient;
        public HangfireJobService(IBackgroundJobClient backgroundJobClient)
        {
            _backgroundJobClient = backgroundJobClient;
        }
        public string Enqueue(Expression<Action> methodCall)
        {
            return _backgroundJobClient.Enqueue(methodCall);
        }

        public string Enqueue<T>(Expression<Action<T>> methodCall)
        {
            return _backgroundJobClient.Enqueue(methodCall);
        }

        public string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay)
        {
            return _backgroundJobClient.Schedule(methodCall, delay);
        }
    }
}
