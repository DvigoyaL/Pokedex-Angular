import { ComponentFixture, TestBed } from '@angular/core/testing';

import  StatsChart  from './stats-chart';

describe('StatsChart', () => {
  let component: StatsChart;
  let fixture: ComponentFixture<StatsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
