using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Tests.model;

namespace TechMeter.Tests
{
    public class PersonClassData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            var names = new string[] { "Ahmed", "Ali", "Sara" };
            var rand = new Random();

            foreach (var name in names)
            {
                yield return new object[]
                {
                new Person { Name = name, Age = rand.Next(10, 50) },
                true
                };
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
