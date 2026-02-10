using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Application.Service.OTPService;

namespace TechMeter.Tests
{
    public class OtpTest
    {
        private readonly Mock<IConnectionMultiplexer> _mockConnectionMultiplexer;
        private readonly Mock<IDatabase> _mockDatabase;
        private readonly Mock<ILogger<OTPService>> _mockLogger;
        private readonly OTPService _otpService;
        public OtpTest()
        {
            _mockConnectionMultiplexer = new();
            _mockDatabase = new();
            _mockLogger = new();
            _mockConnectionMultiplexer.Setup(b => b.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
                .Returns(_mockDatabase.Object);
            _otpService = new(_mockConnectionMultiplexer.Object, _mockLogger.Object);
        }

        [Fact]
        public void Testing_Private_Method()
        {
            //MethodInfo obj = typeof(OTPService).GetMethod("GenerateOtp", BindingFlags.NonPublic | BindingFlags.Instance);
            //var actual = obj.Invoke(_otpService, null).ToString();
            //actual.Should().HaveLength(6);
            var type = typeof(OTPService);
            var method = type.GetMethod("GenerateOtp", BindingFlags.NonPublic | BindingFlags.Instance);
            var result = method.Invoke(_otpService,null).ToString();
            result.Should().BeOfType<string>();
            result.Length.Should().Be(6);
        }
    }
}
