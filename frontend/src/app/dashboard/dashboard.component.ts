/* ============================================================== *
 *  DashboardComponent – fast, signal-driven, pure OnPush         *
 * ============================================================== */
import {
  Component, OnInit, signal, computed, ChangeDetectionStrategy
} from '@angular/core';
import { Router }          from '@angular/router';
import { CommonModule }    from '@angular/common';
import { TabStripModule }  from '@progress/kendo-angular-layout';

import { ContractTreeComponent     } from './sidebar/contract-tree/contract-tree.component';
import { SearchBoxComponent        } from './search/search-box/search-box.component';
import { ActivityGridComponent     } from './grid/activity-grid/activity-grid.component';
import { FilterActivitiesComponent } from './filters/filter-activities/filter-activities.component';
import { OperationHeaderComponent  } from './operation-header/operation-header.component';
import { DashboardDataService      } from '../services/dashboard-data.service';

@Component({
  selector      : 'app-dashboard',
  standalone    : true,
  imports       : [
    CommonModule,
    TabStripModule,
    ContractTreeComponent,
    SearchBoxComponent,
    ActivityGridComponent,
    FilterActivitiesComponent,
    OperationHeaderComponent
  ],
  templateUrl   : './dashboard.component.html',
  styleUrls     : ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  /* ───────── tabs ───────── */
  readonly tabs = [
    'ISPO', 'VDR', 'VDR Revision',
    'OTD Trends', 'Engineering Productivity', 'Technical Alignment'
  ];
  readonly selectedTab = signal('ISPO');

  /* ───────── raw & helper data ───────── */
  private readonly rawData = signal<any[]>([]);
  readonly  selectedContracts = signal<string[]>([]);
  contractList: any[] = [];

  /* ───────── filter signals (empty = OFF) ───────── */
  readonly viewAsFilter         = signal<string[]>([]);
  readonly functionsFilter      = signal<string[]>([]);
  readonly documentTypeFilter   = signal<string[]>([]);
  readonly activityStatusFilter = signal<string[]>([]);
  readonly activityTypeFilter   = signal<string[]>([]);
  readonly finishByFilter       = signal<string[]>([]);
  private  readonly _searchText = signal('');      // debounced
  private searchDebounceHandle: any;

  /* ───────── alert-bar state ───────── */
  resourceRequestsCount = 3;
  readonly showResourceAlert = signal(true);
  dismissResourceAlert() { this.showResourceAlert.set(false); }

  /* ───────── pop-ups ───────── */
  popup: string | null = null;
  profileMenuVisible   = false;

  /* ───────── ctor / init ───────── */
  constructor(
    private dataSvc: DashboardDataService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.dataSvc.getDashboardData().subscribe(data => {
      /* flatten level-1 + level-2 exactly once */
      const flat = data.flatMap(p =>
        p.subProjects.flatMap((l1: any) => {
          const r1 = { ...l1, projectId: p.projectId, tab: 'ISPO' };
          const r2 = (l1.subProjectsLevel2 ?? [])
                     .map((l2: any) => ({ ...l2, projectId: p.projectId, tab: 'ISPO' }));
          return [r1, ...r2];
        })
      );
      this.rawData.set(flat);
      this.contractList = data;
    });
  }

  /* ───────── helpers ───────── */
  private none    = (s: string[]) => s.length === 0;
  private overlap = (sel: string[], val: string | string[] | undefined) =>
    this.none(sel) || (Array.isArray(val) ? val : [val ?? '']).some(v => sel.includes(v));

  /* ───────── memoised, instant filter ───────── */
  private _cacheKey   = '';
  private _cacheValue: any[] = [];

  readonly filteredData = computed(() => {
    /* ultra-cheap key (no JSON.stringify) */
    const key = [
      this.selectedTab(),

      this.viewAsFilter().join('|'),
      this.functionsFilter().join('|'),
      this.documentTypeFilter().join('|'),
      this.activityStatusFilter().join('|'),
      this.activityTypeFilter().join('|'),
      this.finishByFilter().join('|'),

      this.selectedContracts().join('|'),
      this._searchText()
    ].join('¶');                    // a token unlikely in real data

    if (key === this._cacheKey) { return this._cacheValue; }
    this._cacheKey = key;

    return this._cacheValue = this.rawData().filter(r =>
         r.tab === this.selectedTab()                                  &&
         this.overlap(this.viewAsFilter(),         r.viewAs)           &&
         this.overlap(this.documentTypeFilter(),   r.documentType)     &&
         this.overlap(this.activityStatusFilter(), r.activityStatus)   &&
         this.overlap(this.activityTypeFilter(),   r.activityType)     &&
         this.overlap(this.finishByFilter(),       r.finishBy)         &&
         this.overlap(this.functionsFilter(),      r.functions)        &&
         this.selectedContracts().includes(r.projectId)                &&
         ( !this._searchText() || Object.values(r).some(v =>
             String(v).toLowerCase().includes(this._searchText().toLowerCase()) ))
    );
  });

  /* ───────── child callbacks ───────── */
  onProjectSelectionChange = (ids: string[]) => this.selectedContracts.set(ids);
  onTabSelect              = (e: any)        => this.selectedTab.set(this.tabs[e.index]);

  /** ⇢ <app-filter-activities> */
  handleFilterChange(f: any) {
    this.viewAsFilter.set        (f.viewAs);
    this.functionsFilter.set     (f.functions);
    this.documentTypeFilter.set  (f.documentType);
    this.activityStatusFilter.set(f.activityStatus);
    this.activityTypeFilter.set  (f.activityType);
    this.finishByFilter.set      (f.finishBy);
  }

  /** ⇢ <app-search-box> – debounce @ 250 ms */
  handleSearchInput(txt: string) {
    clearTimeout(this.searchDebounceHandle);
    this.searchDebounceHandle = setTimeout(() => this._searchText.set(txt), 250);
  }

  /* ───────── misc helpers ───────── */
  getProjectName(id: string) {
    const p = this.contractList.find(prj => prj.projectId === id);
    return p ? `${p.projectId} – ${p.treePath}` : id;
  }

  /* ───────── pop-ups / avatar menu ───────── */
  openPopup(t: string) { this.popup = t; this.profileMenuVisible = false; }
  closePopup()         { this.popup = null; this.router.navigate(['/dashboard']); }
  toggleProfileMenu()  { this.profileMenuVisible = !this.profileMenuVisible; }
  logout()             { this.router.navigate(['/login']); }
}
