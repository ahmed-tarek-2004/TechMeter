using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Domain.Shared.Bases
{
    public class ResponseHandler
    {
        public Response<string> Deleted(string message=null)
        {
            return new Response<string>()
            {
                StatusCode = HttpStatusCode.OK,
                Succeeded = true,
                Message = message
            };
        }
        public Response<T> Created<T>(T entity, string message = null)
        {
            return new Response<T>()
            {
                Data = entity,
                StatusCode = HttpStatusCode.Created,
                Succeeded = true,
                Message = message
            };
        }
        public Response<T> Success<T>(T entity,string message)
        {
            return new Response<T>()
            {
                Data= entity,
                StatusCode = HttpStatusCode.OK,
                Succeeded = true,
                Message = message,
            };
        }
        public Response<string> UnAuthorized(string message=null)
        {
            return new Response<string>()
            {
                StatusCode = HttpStatusCode.Unauthorized,
                Succeeded = false,
                Message = message
            };
        }
        public Response<string> NotFound(string message = null)
        {
            return new Response<string>()
            {
                StatusCode = System.Net.HttpStatusCode.NotFound,
                Succeeded = false,
                Message = message
            };
        }
        public Response<string>Forbidden(string message=null)
        {
            return new Response<string>()
            {
                StatusCode = HttpStatusCode.Forbidden,
                Succeeded = false,
                Message = message
            };
        }
        public Response<string> BadRequest(string Message = null)
        {
            return new Response<string>()
            {
                StatusCode = System.Net.HttpStatusCode.BadRequest,
                Succeeded = false,
                Message = Message
            };
        }
        public Response<string> InternalServerError(string message = null)
        {
            return new Response<string>()
            {
                StatusCode = System.Net.HttpStatusCode.InternalServerError,
                Succeeded = false,
                Message = message
            };
        }
    }
}
