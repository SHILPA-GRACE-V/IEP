import {
  Component, Input, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import {
  GridModule,
  GridDataResult,
  PageChangeEvent,
  PagerSettings
} from '@progress/kendo-angular-grid';
import { DataResult }   from '@progress/kendo-data-query';

@Component({
  selector   : 'app-activity-grid',
  standalone : true,
  imports    : [CommonModule, FormsModule, GridModule],
  templateUrl: './activity-grid.component.html',
  styleUrls  : ['./activity-grid.component.scss']
})
export class ActivityGridComponent {

  /* ───────── inbound rows ───────────────── */
  @Input() data: any[] = [];

  /* ───────── reactive UI state ──────────── */
  pageSize     = 10;
  skip         = 0;
  globalSearch = '';
  gridExpanded = false;
  showMenu     = false;

  /** Kendo pager configuration */
  readonly pagerSettings: PagerSettings = {
    buttonCount  : 5,
    info         : true,
    previousNext : true,
    type         : 'numeric',
    pageSizes    : [10, 20, 50],
    responsive   : true
  };

  /* ───────── toolbar actions ────────────── */
  toggleExpand(): void { this.gridExpanded = !this.gridExpanded; }
  openSettings(): void  { alert('Settings clicked (not implemented)'); }

  /** Download current (filtered) rows as CSV */
  exportCSV(): void {
    const rows   = this.filterRows();
    if (!rows.length) { return; }

    const header = Object.keys(rows[0]).join(',');
    const body   = rows.map(r => Object.values(r).join(',')).join('\n');
    const blob   = new Blob([header + '\n' + body], { type: 'text/csv' });

    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href        = url;
    link.download    = 'activities.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showMenu = false;
  }

  /** Very simple print helper */
  printGrid(): void {
    window.print();
    this.showMenu = false;
  }

  /* close the 3-dot menu when clicking anywhere else */
  @HostListener('document:click')
  closeMenu(): void { this.showMenu = false; }

  /* ───────── search + paging helpers ───── */
  private filterRows(): any[] {
    const term = this.globalSearch.trim().toLowerCase();
    if (!term) { return this.data; }

    return this.data.filter(row =>
      Object.values(row).some(v =>
        String(v).toLowerCase().includes(term)
      )
    );
  }

  /** Slice for current page (used by template) */
  get pagedData(): GridDataResult | DataResult {
    const rows = this.filterRows();
    return {
      data : rows.slice(this.skip, this.skip + this.pageSize),
      total: rows.length
    };
  }

  pageChange(e: PageChangeEvent): void {
    this.skip     = e.skip;
    this.pageSize = e.take;
  }
}
