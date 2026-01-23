using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests.model
{
    public interface ICarServices
    {
        bool AddCar(Car car);
        bool RemoveCar(int Id);
        List<Car> GetAll();

    }
}
