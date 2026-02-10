using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests
{
    public class TheoryTest
    {

        [Theory]
        [InlineData(2, 3, 5)]
        [InlineData(5, 5, 10)]
        [InlineData(10, -2, 8)]
        public void Add_ReturnsCorrectSum(int a, int b, int expected)
        {
            var result = a + b;
            Assert.Equal(expected, result);
        }
    }
}
