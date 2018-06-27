import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NlsGuillocheComponent } from './nls-guilloche.component';

describe('NlsGuillocheComponent', () => {
  let component: NlsGuillocheComponent;
  let fixture: ComponentFixture<NlsGuillocheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NlsGuillocheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NlsGuillocheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
