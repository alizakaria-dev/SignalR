using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace SignalR.Demo
{
    public class ReservationHub : Hub
    {
        private DataContext _context;
        private readonly IHubContext<ReservationHub> _hubContext;
        public ReservationHub(DataContext context, IHubContext<ReservationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.All.SendAsync("MessageReceived", $"{Context.ConnectionId} has joined");
        }

        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceivedMessage", $"{Context.ConnectionId} : {message}");
        }

        public async Task ReservationLocked(int seatId)
        {
            await Clients.All.SendAsync("ReservationMessage", $"{Context.ConnectionId} :  has unreserved the following seat {seatId} ",true);
        }

        public async Task ReservationUnlocked(int seatId)
        {
            await Clients.All.SendAsync("ReservationMessage", $"{Context.ConnectionId} :  has reserved the following seat {seatId} ", false);
        }

        public async Task GetAllSeats()
        {
            var seats = await GetSeats();
            await Clients.All.SendAsync("AllSeats", seats);
        }

        public async Task UpdateReservationState(int seatId, int userId, bool reservationStatus)
        {
            var seat = new Seat()
            {
                SeatId = seatId,
                PersonId = userId,
                IsReserved = reservationStatus
            };

            var updatedSeat = await UpdateSeat(seat);
            var seats = await GetSeats();
            var user = await _context.Person.FirstOrDefaultAsync(x => x.Id == userId);
            if (reservationStatus)
            {
                await Clients.All.SendAsync("ReservationMessage", $"user {user.Name} has reserved the following table {seatId} ", seats);
            }
            else
            {
                await Clients.All.SendAsync("ReservationMessage", $"user {user.Name}  has unreserved the following table {seatId} ", seats);
            }
        }

        public async Task CloseReservations()
        {
            BackgroundJob.Schedule<ReservationHub>(x => x.MakeAllSeatsReserved(), DateTime.Now.AddSeconds(5));

            await _hubContext.Clients.All.SendAsync("ReservationClosingMessage", "Reservation will close in 5 seconds");

        }

        public async Task<List<Seat>> GetSeats()
        {
            var seats = await _context.Seat.ToListAsync();
            return seats;
        }

        public async Task<Seat> UpdateSeat(Seat seat)
        {
            var updatedSeat = _context.Seat.Update(seat);
            await _context.SaveChangesAsync();
            return seat;
        }

        public async Task MakeAllSeatsReserved()
        {
            var unreservedSeats = await _context.Seat.Where(x => x.IsReserved == false).ToListAsync();
            foreach (var seat in unreservedSeats)
            {
                seat.IsReserved = true;
                _context.Seat.Update(seat);
                await _context.SaveChangesAsync();
            }

            var allSeats = await _context.Seat.ToListAsync();

            await _hubContext.Clients.All.SendAsync("ClosedReservation", "No more reservations are allowed",allSeats);
        }
    }
}
