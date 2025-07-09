import { Component, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';

@Component({
  standalone: true,
  selector: 'app-filter-activities',
  templateUrl: './filter-activities.component.html',
  styleUrls: ['./filter-activities.component.scss'],
  imports: [CommonModule, FormsModule, DropDownListModule]
})
export class FilterActivitiesComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  isExpanded = signal(true);

  readonly viewAsList = [
    { text: 'Individual', value: 'Individual' },
    { text: 'Group', value: 'Group' }
  ];
  readonly functionsList = [
    { text: 'ENG', value: 'ENG' },
    { text: 'TECH', value: 'TECH' },
    { text: 'QA', value: 'QA' }
  ];
  readonly documentTypeList = [
    { text: 'Internal', value: 'Internal' },
    { text: 'Step', value: 'Step' },
    { text: 'External', value: 'External' }
  ];
  readonly statusList = [
    { text: 'Not Completed', value: 'Not Completed' },
    { text: 'Completed', value: 'Completed' },
    { text: 'In Progress', value: 'In Progress' }
  ];
  readonly activityTypeList = [
    { text: '510', value: '510' },
    { text: '520', value: '520' },
    { text: '530', value: '530' },
    { text: '540', value: '540' },
    { text: '550', value: '550' },
    { text: '560', value: '560' },
    { text: '570', value: '570' },
    { text: '580', value: '580' },
    { text: '590', value: '590' }
  ];
  readonly finishByList = [
    { text: 'Late Finish', value: 'Late Finish' },
    { text: 'On Time', value: 'On Time' },
    { text: 'Early Finish', value: 'Early Finish' }
  ];
  readonly dateTypeList = [
    { text: 'Business', value: 'Business' },
    { text: 'Calendar', value: 'Calendar' }
  ];

  // ✅ Reactive signal values
  viewAs = signal<string | null>(null);
  functions = signal<string | null>(null);
  documentType = signal<string | null>(null);
  status = signal<string | null>(null);
  activityType = signal<string | null>(null);
  finishBy = signal<string | null>(null);
  dateType = signal<string | null>(null);

  ngOnInit(): void {
    this.clearFilters();
  }

  emitFilters(): void {
    this.filtersChanged.emit({
      viewAs: this.viewAs() ? [this.viewAs()] : [],
      functions: this.functions() ? [this.functions()] : [],
      documentType: this.documentType() ? [this.documentType()] : [],
      activityStatus: this.status() ? [this.status()] : [],
      activityType: this.activityType() ? [this.activityType()] : [],
      finishBy: this.finishBy() ? [this.finishBy()] : [],
      dateType: this.dateType() ? [this.dateType()] : []
    });
  }

  onAnyChange() {
    this.emitFilters();
  }

  clearFilters(): void {
    this.viewAs.set(null);
    this.functions.set(null);
    this.documentType.set(null);
    this.status.set(null);
    this.activityType.set(null);
    this.finishBy.set(null);
    this.dateType.set(null);
    this.emitFilters();
  }

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }
}
