import { TestBed } from '@angular/core/testing';

import { ReservationHubService } from './reservation-hub.service';

describe('ReservationHubService', () => {
  let service: ReservationHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
