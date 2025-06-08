import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';

@Component({
  standalone: true,
  selector: 'app-filter-activities',
  imports: [CommonModule, FormsModule, DropDownListModule],
  templateUrl: './filter-activities.component.html',
  styleUrls: ['./filter-activities.component.scss']
})
export class FilterActivitiesComponent {
  @Output() filtersChanged = new EventEmitter<any>();
  isExpanded = signal(true);

  viewAsList = ['Individual', 'Group'];
  functionsList = ['ENG', 'TECH', 'QA'];
  documentTypeList = ['Internal', 'Step', 'External'];
  statusList = ['Not Completed', 'Completed', 'In Progress'];
  activityTypeList = ['510', '520', '530', '540', '550', '560', '570', '580', '590'];
  finishByList = ['Late Finish', 'On Time', 'Early Finish'];
  dateTypeList = ['Business', 'Calendar'];

  viewAs = signal('');
  functions = signal('');
  documentType = signal('');
  status = signal('');
  activityType = signal('');
  finishBy = signal('');
  dateType = signal('');

  onAnyChange() {
    this.filtersChanged.emit({
      viewAs: this.viewAs(),
      functions: this.functions(),
      documentType: this.documentType(),
      activityStatus: this.status(),
      activityType: this.activityType(),
      finishBy: this.finishBy(),
      dateType: this.dateType()
    });
  }

  clearFilters() {
    this.viewAs.set('');
    this.functions.set('');
    this.documentType.set('');
    this.status.set('');
    this.activityType.set('');
    this.finishBy.set('');
    this.dateType.set('');
    this.onAnyChange();
  }

  toggleExpanded() {
    this.isExpanded.update(state => !state);
  }
}
