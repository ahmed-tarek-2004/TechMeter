using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests.model
{
    public interface ICarRepository
    {
        bool Exists(int id);
        void Add(Car car);
        void Remove(Car car);
        Car? GetById(int id);
        List<Car> GetAll();
    }
}
