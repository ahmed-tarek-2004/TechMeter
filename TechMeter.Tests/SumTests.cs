using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Tests.model;

namespace TechMeter.Tests
{
    public class SumTests
    {
        [Theory]
        [ClassData(typeof(SumClassData))]
        public void Test_Sums_For_Class_Data(int[] numbers, int expected)
        {
            int sum = 0;
            for (int i = 0; i < numbers.Length; i++)
            {
                sum += numbers[i];
            }
            Assert.Equal(expected, sum);
        }
        [Theory]
        [ClassData(typeof(PersonClassData))]
        public void Test_Person_For_Class_Data(Person person, bool expected)
        {
            bool actual = person.Age > 18;
            Assert.Equal(expected, actual);
        }


        [Theory]
        [MemberData(nameof(PersonMeberData.GetEvenNumbers), MemberType = typeof(PersonMeberData))]
        public void Test_IsEvenNumber(int number, bool expected)
        {
            bool actual = number % 2 == 0;

            Assert.Equal(expected, actual);
        }


    }
}
