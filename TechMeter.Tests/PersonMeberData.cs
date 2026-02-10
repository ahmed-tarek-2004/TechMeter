using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechMeter.Tests.model;

namespace TechMeter.Tests
{
    public class PersonMeberData : IEnumerable<Object[]>
    {
        public static IEnumerable<object[]> GetEvenNumbers()
        {

            yield return new object[] { 2, true };
            yield return new object[] { 5, false };
            yield return new object[] { 8, true };

            for (int i = 10; i <= 14; i++)
            {
                bool isEven = i % 2 == 0;
                yield return new object[] { i, isEven };
            }

            // هنا انا عملتلك نوعين من الداتا ثابتة و dynamic
        }

        public IEnumerator<object[]> GetEnumerator()
        {
            return (IEnumerator<Object[]>)GetEvenNumbers();
        }
        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
