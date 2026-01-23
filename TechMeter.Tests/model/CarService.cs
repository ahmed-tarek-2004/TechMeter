using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests.model
{
    public class CarService : ICarServices
    {
        private readonly List<Car> _cars;
        public CarService(List<Car> cars)
        {
            _cars=cars;
        }

        public bool AddCar(Car car)
        {
            if (car == null)
            {
                return false;
            }
            if (_cars.Any(i => i.Id == car.Id))
                return false;
            _cars.Add(car);
            return true;
        }

        public List<Car> GetAll()
        {
            return _cars;
        }

        public bool RemoveCar(int Id)
        {
            if (Id == 0) return false;
            if (_cars.Any(i => i.Id == Id))
            {
                var car = _cars.FirstOrDefault(i => Id == Id);
                _cars.Remove(car!);
                return false;
            }
            return false;
        }
    }
}
