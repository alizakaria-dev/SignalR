import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ReservationHubService {
  public hubConnection!: signalR.HubConnection;
  public seatsSubject: BehaviorSubject<Seat[]> = new BehaviorSubject<Seat[]>(
    []
  );
  public reservationMessage: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5298/reservation', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();
  }

  startConnection(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.hubConnection
        .start()
        .then(() => {
          console.log('Connection established with SignalR hub');
          observer.next(true);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error connecting to SignalR hub:', error);
          observer.error(error);
        });
    });
  }

  async GetAllSeats() {
    try {
      const seats = await this.hubConnection.invoke('GetAllSeats');
    } catch (error) {
      console.error('Error invoking GetAllSeats:', error);
    }
  }

  async GetAllSeatsListener() {
    try {
      await this.hubConnection.on('AllSeats', (result: Seat[]) => {
        this.seatsSubject.next(result);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async UpdateSeatStatus(
    seatId: number,
    userId: number,
    reservationStatus: boolean
  ) {
    try {
      await this.hubConnection.invoke(
        'UpdateReservationState',
        seatId,
        userId,
        reservationStatus
      );
    } catch (error) {
      console.error(error);
    }
  }

  async UpdateSeatStatusListener() {
    try {
      await this.hubConnection.on(
        'ReservationMessage',
        (message: string, seats: Seat[]) => {
          this.seatsSubject.next(seats);
          this.reservationMessage.next(message);
          console.log(message, seats);
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async CloseReservations() {
    try {
      await this.hubConnection.invoke('CloseReservations');
    } catch (error) {
      console.error(error);
    }
  }

  async CloseReservationsListener() {
    try {
      this.hubConnection.on('ReservationClosingMessage', (message: string) => {
        console.log(message);
        this.reservationMessage.next(message);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async AllSeatsReservedListener() {
    try {
      this.hubConnection.on(
        'ClosedReservation',
        (message: string, seats: Seat[]) => {
          console.log(message);
          console.log(seats);
          this.reservationMessage.next(message);
          this.seatsSubject.next(seats);
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

export class Seat {
  seatId!: number;
  isReserved!: boolean;
  personId!: number;
}
