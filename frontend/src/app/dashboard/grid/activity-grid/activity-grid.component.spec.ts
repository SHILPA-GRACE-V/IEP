import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityGridComponent } from './activity-grid.component';
import { By } from '@angular/platform-browser';

describe('ActivityGridComponent', () => {
  let component: ActivityGridComponent;
  let fixture: ComponentFixture<ActivityGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept input data and display it', () => {
    component.data = [
      {
        projectId: 'PRJ001',
        activityId: 'ACT101',
        activityName: 'Pipe Installation',
        primaryResource: 'John Doe',
        earlyDate: '2024-10-12'
      }
    ];
    fixture.detectChanges();

    const gridRows = fixture.debugElement.queryAll(By.css('kendo-grid'));
    expect(gridRows.length).toBe(1);
    expect(component.filteredGridData.length).toBe(1);
  });

  it('should filter rows based on global search', () => {
    component.data = [
      { projectId: 'P1', activityId: 'A1', activityName: 'Test Activity One', primaryResource: 'Alice', earlyDate: '2024-01-01' },
      { projectId: 'P2', activityId: 'A2', activityName: 'Another Activity', primaryResource: 'Bob', earlyDate: '2024-01-02' }
    ];
    component.globalSearch = 'alice';
    fixture.detectChanges();

    const result = component.filteredGridData;
    expect(result.length).toBe(1);
    expect(result[0].primaryResource).toBe('Alice');
  });
});
