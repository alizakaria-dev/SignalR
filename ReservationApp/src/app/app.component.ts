import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {
  ReservationHubService,
  Seat,
} from './Services/reservation-hub.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'ReservationApp';
  seats!: Seat[];
  seatsNormal!: Seat[];
  message!: string;
  freeSeats!: number;
  constructor(private reservationService: ReservationHubService) {}
  ngOnInit(): void {
    this.reservationService.startConnection().subscribe({
      next: (result) => {
        this.reservationService.GetAllSeats();
        this.reservationService.GetAllSeatsListener();
        const res = this.reservationService.seatsSubject.subscribe({
          next: (r) => {
            console.log('this is the seat subject value', r),
              (this.seats = r),
              (this.freeSeats = this.seats.filter(
                (x) => x.isReserved == false
              ).length);
          },
        });
      },
    });
  }

  Reservation(seatId: number, userId: number, isReserved: boolean) {
    if (isReserved) {
      this.reservationService.UpdateSeatStatus(seatId, userId, false);
      this.reservationService.reservationMessage.subscribe({
        next: (result) => (this.message = result),
      });
    } else {
      this.reservationService.UpdateSeatStatus(seatId, userId, true);
      this.reservationService.reservationMessage.subscribe({
        next: (result) => (this.message = result),
      });
    }
    this.reservationService
      .UpdateSeatStatusListener()
      .then((res) => console.log(res));
  }

  async HandleReservationClosing() {
    await this.reservationService.CloseReservations();
    await this.reservationService.CloseReservationsListener();
    await this.reservationService.AllSeatsReservedListener();
  }
}
