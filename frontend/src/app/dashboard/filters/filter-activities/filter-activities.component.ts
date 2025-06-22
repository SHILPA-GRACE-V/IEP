/* =================================================================== *
 *  FilterActivitiesComponent – one-chip comma display                 *
 * =================================================================== */
import { Component, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule  } from '@angular/forms';
import { MultiSelectModule }
        from '@progress/kendo-angular-dropdowns';

@Component({
  standalone : true,
  selector   : 'app-filter-activities',
  templateUrl: './filter-activities.component.html',
  styleUrls  : ['./filter-activities.component.scss'],
  imports    : [CommonModule, FormsModule, MultiSelectModule]
})
export class FilterActivitiesComponent implements OnInit {

  @Output() filtersChanged = new EventEmitter<any>();
  isExpanded = signal(true);

  /* master option pools */
  readonly viewAsList       = ['Individual', 'Group'];
  readonly functionsList    = ['ENG', 'TECH', 'QA'];
  readonly documentTypeList = ['Internal', 'Step', 'External'];
  readonly statusList       = ['Not Completed', 'Completed', 'In Progress'];
  readonly activityTypeList = ['510','520','530','540','550','560','570','580','590'];
  readonly finishByList     = ['Late Finish', 'On Time', 'Early Finish'];
  readonly dateTypeList     = ['Business', 'Calendar'];

  /* reactive selections */
  viewAs       = signal<string[]>([]);
  functions    = signal<string[]>([]);
  documentType = signal<string[]>([]);
  status       = signal<string[]>([]);
  activityType = signal<string[]>([]);
  finishBy     = signal<string[]>([]);
  dateType     = signal<string[]>([]);

  /* show everything in ONE chip, comma-separated */
  readonly commaLabel = (items: string[]) => items.join(', ');

  ngOnInit(): void {
    /* start with ALL values selected (= no filter) */
    this.viewAs.set      ([...this.viewAsList]);
    this.functions.set   ([...this.functionsList]);
    this.documentType.set([...this.documentTypeList]);
    this.status.set      ([...this.statusList]);
    this.activityType.set([...this.activityTypeList]);
    this.finishBy.set    ([...this.finishByList]);
    this.dateType.set    ([...this.dateTypeList]);
    this.emitFilters();
  }

  /** shrink “all selected” → [] so the dashboard treats it as OFF */
  private diff(sel: string[], pool: string[]) {
    return sel.length === pool.length ? [] : sel;
  }

  emitFilters(): void {
    this.filtersChanged.emit({
      viewAs        : this.diff(this.viewAs(),       this.viewAsList),
      functions     : this.diff(this.functions(),    this.functionsList),
      documentType  : this.diff(this.documentType(), this.documentTypeList),
      activityStatus: this.diff(this.status(),       this.statusList),
      activityType  : this.diff(this.activityType(), this.activityTypeList),
      finishBy      : this.diff(this.finishBy(),     this.finishByList),
      dateType      : this.diff(this.dateType(),     this.dateTypeList)
    });
  }

  onAnyChange() { this.emitFilters(); }

  clearFilters(): void {
    this.viewAs.set([]); this.functions.set([]); this.documentType.set([]);
    this.status.set([]); this.activityType.set([]); this.finishBy.set([]);
    this.dateType.set([]); this.emitFilters();
  }

  toggleExpanded() { this.isExpanded.update(v => !v); }
}
