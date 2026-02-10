using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests
{
    internal class SumClassData : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            yield return new object[] { new int[] { 1, 2, 3 }, 6 };
            yield return new object[] { new int[] { 4, 5, 6 }, 15 };
            yield return new object[] { new int[] { 7, 8, 9 }, 24 };
        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();


    }


}
