import { TestBed } from '@angular/core/testing';

import { CardStateService } from './card-state.service';

describe('CardStateService', () => {
  let service: CardStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
