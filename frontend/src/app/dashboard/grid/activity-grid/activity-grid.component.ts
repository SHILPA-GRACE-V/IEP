import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GridModule,
  GridDataResult,
  PageChangeEvent,
  PagerSettings
} from '@progress/kendo-angular-grid';
import {
  SortDescriptor,
  orderBy
} from '@progress/kendo-data-query';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, GridModule],
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss']
})
export class ActivityGridComponent {
  @Input() data: any[] = [];
  @Input() viewAs: string[] = [];
  @Input() functions: string[] = [];
  @Input() documentType: string[] = [];
  @Input() activityStatus: string[] = [];
  @Input() activityType: string[] = [];
  @Input() finishBy: string[] = [];

  @Output() expandChange = new EventEmitter<boolean>();

  pageSize = 10;
  skip = 0;
  globalSearch = '';
  gridExpanded = false;
  showMenu = false;
  sort: SortDescriptor[] = [];

  showColumnFilter: string | null = null;
  filterMenuPosition: { top: number; left: number } = { top: 0, left: 0 };
  columnFilterValue: { [key: string]: Set<string> } = {};

  readonly pagerSettings: PagerSettings = {
    buttonCount: 5,
    info: true,
    previousNext: true,
    type: 'numeric',
    pageSizes: [10, 20, 50],
    responsive: true
  };

  toggleExpand(): void {
    this.gridExpanded = !this.gridExpanded;
    this.expandChange.emit(this.gridExpanded);
  }

  openSettings(): void {
    alert('Settings clicked (not implemented)');
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.showMenu = false;
    this.showColumnFilter = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    this.closeMenu();
  }

  exportCSV(): void {
    const rows = this.pagedData.data;
    if (!rows.length) return;

    const header = Object.keys(rows[0]).join(',');
    const body = rows.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activities.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showMenu = false;
  }

  printGrid(): void {
    window.print();
    this.showMenu = false;
  }

  onSortClick(field: string): void {
    const current = this.sort?.[0];
    const dir = current?.field === field && current.dir === 'asc' ? 'desc' : 'asc';
    this.sort = [{ field, dir }];
  }

  onSortChange(descriptor: SortDescriptor[]): void {
    this.sort = descriptor;
  }

  toggleColumnFilterMenu(field: string, event: MouseEvent): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.filterMenuPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
    this.showColumnFilter = this.showColumnFilter === field ? null : field;
  }

  toggleFilterValue(field: string, value: string): void {
    if (!this.columnFilterValue[field]) {
      this.columnFilterValue[field] = new Set();
    }
    const selected = this.columnFilterValue[field];
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      selected.add(value);
    }
  }

  isValueSelected(field: string, value: string): boolean {
    return this.columnFilterValue[field]?.has(value);
  }

  clearFilter(field: string): void {
    this.columnFilterValue[field] = new Set();
  }

  getUniqueValues(field: string): string[] {
    const values = this.data.map(row => row[field]).filter(v => v != null);
    return Array.from(new Set(values.map(v => String(v)))).sort();
  }

  private normalize = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value)
    ? value.map(v => String(v).trim().toLowerCase())
    : String(value).split(',').map(v => v.trim().toLowerCase());
};

private overlap = (filter: string[], value: string | string[] | undefined): boolean => {
  if (!filter.length) return true;
  const normalized = this.normalize(value);
  const selectedSet = new Set(filter.map(v => String(v).trim().toLowerCase()));
  return normalized.some(v => selectedSet.has(v));
};


  private filterRows(): any[] {
    const term = this.globalSearch.trim().toLowerCase();
    let rows = [...this.data];

    rows = rows.filter(row =>
      this.overlap(this.viewAs, row.viewAs) &&
      this.overlap(this.functions, row.functions) &&
      this.overlap(this.documentType, row.documentType) &&
      this.overlap(this.activityStatus, row.activityStatus) &&
      this.overlap(this.activityType, row.activityType) &&
      this.overlap(this.finishBy, row.finishBy)
    );

    if (term) {
      rows = rows.filter((row: any) =>
        Object.values(row).some(v => String(v).toLowerCase().includes(term))
      );
    }

    Object.entries(this.columnFilterValue).forEach(([field, selected]) => {
      if (selected && selected.size > 0) {
        rows = rows.filter(row => selected.has(String(row[field])));
      }
    });

    return orderBy(rows, this.sort);
  }

  get pagedData(): GridDataResult {
    const rows = this.filterRows();
    return {
      data: rows.slice(this.skip, this.skip + this.pageSize),
      total: rows.length
    };
  }

  pageChange(e: PageChangeEvent): void {
    this.skip = e.skip;
    this.pageSize = e.take;
  }
}
