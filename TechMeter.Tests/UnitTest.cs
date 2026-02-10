using FluentAssertions;
using Moq;
using TechMeter.Tests.model;
namespace TechMeter.Tests
{
    public class UnitTest
    {
        [Fact]
        public void test_sum_of_2_and_3()
        {
            //Arrange
            int x = 2;
            int y = 3;
            //Act

            int z = x + y;

            //Assert
            Assert.Equal(5, z);
        }
        [Fact]
        public void test_nullabe_Exception_Argument()
        {

            //Arrange

            int? x = null;
            int y = 3;
            Action<int?> func = (x) =>
            {
                if (x == null)
                {
                    throw new ArgumentNullException(nameof(x));
                }
                ;
            };
            //Act

            //Assrrt
            Assert.Throws<ArgumentNullException>(() => func(x));
        }
        [Fact]
        public void test_string_end_with_come_word()
        {
            string name = "Welcome";
            Assert.EndsWith("come", name);
        }
        [Fact]
        public void test_string_with_length_equal_5()
        {
            string name = "ahmed";
            Assert.True(name.Length == 5);
        }
        [Fact]
        public void test_should_be_not_null_or_not_have_spaces()
        {
            string name = " ";
            Assert.NotEmpty(name);
        }

        [Fact]
        public void test_two_sums_using_fluent_assertion()
        {
            int x = 5;
            int y = 4;

            int z = x + y;

            z.Should().Be(9);
        }
        [Fact]
        public void test_nearest_value_using_fluent_assertion()
        {
            int x = 5;
            int y = 4;

            int z = x + y;

            z.Should().BeCloseTo(7, 2, "Must be more or less by 2 values");
        }

        [Fact]
        public void test_string_start_with_A_letter()
        {
            string name = "Ahmed";
            name.Should().StartWith("A");
        }
        [Fact]
        public void test_string_end_with_come_word_with_fluent_assertion()
        {
            string name = "Welcome";
            name.Should().EndWith("come");
        }
        [Fact]
        public void test_string_with_length_equal_5_with_fluent_assertion()
        {
            string name = "ahmed";
            name.Should().HaveLength(5);
        }
        [Fact]
        public void test_string_with_length_equal_5_and_equal_ahmed_with_fluent_assertion()
        {
            string name = "ahmed";
            name.Should().HaveLength(5).And.Be("ahmed");
        }
        [Fact]
        public void test_should_be_not_null_or_not_have_spaces_with_fluent_assertion()
        {
            string name = "ahmedtarek";
            name.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public void check_string_types_with_fluent_assertion()
        {
            var name = "ahmed";
            name.Should().BeOfType<string>(name);
        }
        [Fact]
        public void check_boolen_with_fluent_assertion()
        {
            int num = 5;
            //int y = 6;

            bool checking = (num & 1) == 1 ? true : false;
            checking.Should().BeTrue();

        }
        [Fact]
        public void check_numbert_is_postive_with_fluent_assertion()
        {
            int num = 5;
            num.Should().BePositive();

        }
        public class CarServiceTests
        {
            [Fact]
            public void AddCar_Should_Call_Add_When_Not_Exists()
            {
                // Arrange
                var repoMock = new Mock<ICarRepository>();
                repoMock.Setup(r => r.Exists(It.IsAny<int>()))
                        .Returns(false);

                var service = new CarService(repoMock.Object);
                var car = new Car { Id = 1, Name = "BMW" };

                // Act
                var result = service.AddCar(car);

                // Assert
                result.Should().BeTrue();
            }
        }


    }
}
