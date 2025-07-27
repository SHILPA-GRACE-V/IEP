import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabStripModule } from '@progress/kendo-angular-layout';

import { ContractTreeComponent } from './sidebar/contract-tree/contract-tree.component';
import { SearchBoxComponent } from './search/search-box/search-box.component';
import { ActivityGridComponent } from './grid/activity-grid/activity-grid.component';
import { FilterActivitiesComponent } from './filters/filter-activities/filter-activities.component';
import { OperationHeaderComponent } from './operation-header/operation-header.component';
import { DashboardDataService } from '../services/dashboard-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TabStripModule,
    ContractTreeComponent,
    SearchBoxComponent,
    ActivityGridComponent,
    FilterActivitiesComponent,
    OperationHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly tabs = ['ISPO', 'VDR', 'VDR Revision', 'VDR Finalization', 'OTD Trends', 'Engineering Productivity', 'Technical Alignment'];
  readonly selectedTab = signal('ISPO');
  readonly selectedTabIndex = signal(0); 

  readonly filterPanelExpanded = signal(true);
  readonly isGridExpanded = signal(false);
  readonly showSidebar = computed(() => !this.isGridExpanded());
  readonly showFilters = computed(() => !this.isGridExpanded());

  private readonly rawData = signal<any[]>([]);
  readonly selectedActivityIds = signal<string[]>([]);
  contractList: any[] = [];

  readonly viewAsFilter = signal<string[]>([]);
  readonly functionsFilter = signal<string[]>([]);
  readonly documentTypeFilter = signal<string[]>([]);
  readonly activityStatusFilter = signal<string[]>([]);
  readonly activityTypeFilter = signal<string[]>([]);
  readonly finishByFilter = signal<string[]>([]);
  private readonly _searchText = signal('');
  private searchDebounceHandle: any;

  resourceRequestsCount = 3;
  readonly showResourceAlert = signal(true);
  readonly popup = signal<string | null>(null);
  profileMenuVisible = false;

  constructor(private dataSvc: DashboardDataService, private router: Router) {}

  ngOnInit(): void {
    this.dataSvc.getDashboardData().subscribe(data => {
      const flat = data.flatMap(p =>
        p.subProjects.flatMap((l1: any) => {
          const r1 = { ...l1, projectId: p.projectId, tab: 'ISPO' };
          const r2 = (l1.subProjectsLevel2 ?? []).map((l2: any) => ({
            ...l2,
            projectId: p.projectId,
            tab: 'ISPO'
          }));
          return [r1, ...r2];
        })
      );
      this.rawData.set(flat);
      this.contractList = data;
    });
  }

  toggleFilterPanel() {
    this.filterPanelExpanded.update(v => !v);
  }

  onProjectSelectionChange = (activityIds: string[]) => {
    this.selectedActivityIds.set(activityIds);
  };


  onTabSelect = (e: any) => {
    this.selectedTabIndex.set(e.index);
    this.selectedTab.set(this.tabs[e.index]);
  };

  handleFilterChange(f: any) {
    this.viewAsFilter.set(f.viewAs.map((v: any) => v.value ?? v));
    this.functionsFilter.set(f.functions.map((v: any) => v.value ?? v));
    this.documentTypeFilter.set(f.documentType.map((v: any) => v.value ?? v));
    this.activityStatusFilter.set(f.activityStatus.map((v: any) => v.value ?? v));
    this.activityTypeFilter.set(f.activityType.map((v: any) => v.value ?? v));
    this.finishByFilter.set(f.finishBy.map((v: any) => v.value ?? v));
  }

  handleSearchInput(txt: string) {
    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => this._searchText.set(txt), 250);
  }

  openPopup(t: string) {
    this.popup.set(t);
    this.profileMenuVisible = false;
  }

  closePopup() {
    this.popup.set(null);
    this.router.navigate(['/dashboard']);
  }

  toggleProfileMenu() {
    this.profileMenuVisible = !this.profileMenuVisible;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  handleGridExpandChange(expanded: boolean) {
    this.toggleGridAndFilters(expanded);
  }

  toggleGridAndFilters(expanded: boolean) {
    this.isGridExpanded.set(expanded);
    this.filterPanelExpanded.set(!expanded);
  }

  toggleExpandFromGrid(): void {
    const newVal = !this.isGridExpanded();
    this.toggleGridAndFilters(newVal);
  }

  private overlap = (selected: string[], value: string | string[] | undefined): boolean => {
    if (!selected.length) return true;

    const valueArray = Array.isArray(value)
      ? value.map(v => String(v).trim().toLowerCase())
      : typeof value === 'string'
        ? value.split(',').map(v => v.trim().toLowerCase())
        : [];

    const selectedSet = new Set(selected.map(v => String(v).trim().toLowerCase()));
    return valueArray.some(v => selectedSet.has(v));
  };

  private _cacheKey = '';
  private _cacheValue: any[] = [];

  readonly filteredData = computed(() => {
    const key = [
      this.selectedTab(),
      this.viewAsFilter().join('|'),
      this.functionsFilter().join('|'),
      this.documentTypeFilter().join('|'),
      this.activityStatusFilter().join('|'),
      this.activityTypeFilter().join('|'),
      this.finishByFilter().join('|'),
      this.selectedActivityIds().join('|'),
      this._searchText()
    ].join('¶');

    if (key === this._cacheKey) return this._cacheValue;
    this._cacheKey = key;

    const result = this.rawData().filter(r =>
      r.tab === this.selectedTab() &&
      this.overlap(this.viewAsFilter(), r.viewAs) &&
      this.overlap(this.functionsFilter(), r.functions) &&
      this.overlap(this.documentTypeFilter(), r.documentType) &&
      this.overlap(this.activityStatusFilter(), r.activityStatus) &&
      this.overlap(this.activityTypeFilter(), r.activityType) &&
      this.overlap(this.finishByFilter(), r.finishBy) &&
      (this.selectedActivityIds().length === 0 || this.selectedActivityIds().includes(r.activityId)) &&
      (!this._searchText() || Object.values(r).some(v =>
        String(v).toLowerCase().includes(this._searchText().toLowerCase())))
    );

    return this._cacheValue = result;
  });
}
