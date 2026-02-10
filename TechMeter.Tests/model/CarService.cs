using Microsoft.AspNetCore.Cors.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TechMeter.Tests.model
{
    //public class CarService : ICarServices
    //{
    //    private readonly List<Car> _cars;
    //    public CarService(List<Car> cars)
    //    {
    //        _cars=cars;
    //    }

    //    public bool AddCar(Car car)
    //    {
    //        if (car == null)
    //        {
    //            return false;
    //        }
    //        if (_cars.Any(i => i.Id == car.Id))
    //            return false;
    //        _cars.Add(car);
    //        return true;
    //    }

    //    public List<Car> GetAll()
    //    {
    //        return _cars;
    //    }

    //    public bool RemoveCar(int Id)
    //    {
    //        if (Id == 0) return false;
    //        if (_cars.Any(i => i.Id == Id))
    //        {
    //            var car = _cars.FirstOrDefault(i => Id == Id);
    //            _cars.Remove(car!);
    //            return false;
    //        }
    //        return false;
    //    }
    //}
    public class CarService : ICarServices
    {
        private readonly ICarRepository _repo;

        public CarService(ICarRepository repo)
        {
            _repo = repo;
        }

        public bool AddCar(Car car)
        {
            if (car is null) return false;
            if (_repo.Exists(car.Id)) return false;

            _repo.Add(car);
            return true;
        }

        public bool RemoveCar(int id)
        {
            if (id <= 0) return false;

            var car = _repo.GetById(id);
            if (car is null) return false;

            _repo.Remove(car);
            return true;
        }

        public List<Car> GetAll()
        {
            return _repo.GetAll();
        }

        private string ForTest()
        {
            return "test";
        }
    }
}
