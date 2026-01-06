using System.ComponentModel.DataAnnotations;

namespace Domain
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; }
        public int quantity { get; set; }
    }
}
