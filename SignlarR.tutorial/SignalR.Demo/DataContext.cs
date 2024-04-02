using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace SignalR.Demo
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {

        }
     
        public DbSet<Person> Person { get; set; }
        public DbSet<Seat> Seat { get; set; }
    }
}
