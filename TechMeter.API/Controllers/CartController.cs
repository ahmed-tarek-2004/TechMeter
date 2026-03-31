using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechMeter.Application.DTO.Cart;
using TechMeter.Application.Features.Cart.Command.AddToCart;
using TechMeter.Application.Features.Cart.Query.GetProviderStudentCart;
using TechMeter.Application.Features.Cart.Query.GetStudentCart;
using TechMeter.Application.Interfaces.Cart;
using TechMeter.Domain.Shared.Bases;
using TechMeter.Infrastructure.Persistence;

namespace TechMeter.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ILogger<CartController> _logger;
        private readonly ICartService _cartService;
        private readonly ApplicationDbContext _context;
        private readonly ResponseHandler _responseHandler;
        private readonly IValidator<UpdateCartItemRequest> _updateCartItemRequestValidator;
        public CartController(IMediator mediator, IMapper mapper, ILogger<CartController> logger, ApplicationDbContext context,
            ICartService cartService, ResponseHandler responseHandler,
            IValidator<UpdateCartItemRequest> updateCartItemRequestValidator)
        {
            _logger = logger;
            _context = context;
            _cartService = cartService;
            _mapper = mapper;
            _mediator = mediator;
            _responseHandler = responseHandler;
            _updateCartItemRequestValidator = updateCartItemRequestValidator;
        }

        [Authorize(Roles = "student")]
        [HttpGet("student/cart")]
        public async Task<ActionResult<Response<CartResponse>>> GetCartAsync()
        {
            var command = new GetStudentCartQuery(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "provider")]
        [HttpGet("provider/cart/{studentId}")]
        public async Task<ActionResult<Response<CartResponse>>> GetProviderCartAsync([FromRoute] string studentId)
        {
            var command = new GetProviderStudentCartCommand(User.FindFirst(ClaimTypes.NameIdentifier)?.Value??"", studentId);
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpPost("student/add/to/cart")]
        public async Task<ActionResult<Response<CartResponse>>> AddToCartAsync([FromBody] CartRequest cartRequest)
        {
            var command = _mapper.Map<AddToCartCommand>(cartRequest);
            command.StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _mediator.Send(command);
            return StatusCode((int)response.StatusCode, response);
        }
        //[Authorize(Roles = "student")]
        //[HttpPut("Student/update/cartItem")]
        //public async Task<ActionResult<Response<CartResponse>>> UpdateCartItemAsync([FromBody] UpdateCartItemRequest request)
        //{
        //    var Validation = await _updateCartItemRequestValidator.ValidateAsync(request);
        //    if (!Validation.IsValid)
        //    {
        //        var error = string.Join(",", Validation.Errors.Select(b => b.ErrorMessage));
        //        return StatusCode((int)_responseHandler.BadRequest<CartResponse>(error).StatusCode,
        //            _responseHandler.BadRequest<CartResponse>(error));
        //    }
        //    var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    var response = await _cartService.UpdateCartAsync(StudentId ?? "", request);
        //    return StatusCode((int)response.StatusCode, response);
        //}

        [Authorize(Roles = "student")]
        [HttpDelete("delete/Student/cart/{CartItemId}")]
        public async Task<ActionResult<Response<CartResponse>>> RemoveFromCartAsync([FromRoute] string CartItemId)
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.RemoveFromCartAsync(StudentId ?? "", CartItemId.ToString());
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "student")]
        [HttpDelete("clear/Student/cart")]
        public async Task<ActionResult<Response<CartResponse>>> ClearStudentCartAsync()
        {
            var StudentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var response = await _cartService.ClearStudentCartAsync(StudentId ?? "");
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
