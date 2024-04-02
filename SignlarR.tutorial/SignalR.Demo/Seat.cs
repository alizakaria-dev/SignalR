using System.ComponentModel.DataAnnotations;

namespace SignalR.Demo
{
    public class Seat
    {
        [Key]
        public int SeatId { get; set; }
        public bool IsReserved { get; set; }
        public int PersonId { get; set; }
        //public Person Person { get; set; }
    }
}
