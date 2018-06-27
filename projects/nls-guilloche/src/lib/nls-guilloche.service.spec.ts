import { TestBed, inject } from '@angular/core/testing';

import { NlsGuillocheService } from './nls-guilloche.service';

describe('NlsGuillocheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NlsGuillocheService]
    });
  });

  it('should be created', inject([NlsGuillocheService], (service: NlsGuillocheService) => {
    expect(service).toBeTruthy();
  }));
});
