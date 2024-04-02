using System.ComponentModel.DataAnnotations;

namespace SignalR.Demo
{
    public class Person
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
