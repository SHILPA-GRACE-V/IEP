import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractTreeComponent } from './contract-tree.component';

describe('ContractTreeComponent', () => {
  let component: ContractTreeComponent;
  let fixture: ComponentFixture<ContractTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContractTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
