import { TestBed } from '@angular/core/testing';

import { RedirectUrlService } from './redirect-url.service';

describe('RedirectUrlService', () => {
  let service: RedirectUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedirectUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
