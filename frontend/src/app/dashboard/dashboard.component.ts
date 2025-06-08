import { Component, OnInit, signal, computed } from '@angular/core';
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
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tabs = ['ISPO', 'VDR', 'VDR Revision', 'OTD Trends', 'Engineering Productivity', 'Technical Alignment'];
  selectedTab = signal(this.tabs[0]); // Default to 'ISPO'

  rawData = signal<any[]>([]);
  searchText = signal('');
  viewAsFilter = signal('');
  functionFilter = signal('');
  documentTypeFilter = signal('');
  activityStatusFilter = signal('');
  activityTypeFilter = signal('');
  finishByFilter = signal('');
  dateTypeFilter = signal('');
  selectedContracts = signal<string[]>([]);
  contractsData = signal<any[]>([]);

  profileMenuVisible = false;
  popup: string | null = null;

  constructor(private dataService: DashboardDataService, private router: Router) {}

  ngOnInit(): void {
  this.dataService.getDashboardData().subscribe(data => {
    const flat = data.flatMap(project =>
      project.subProjects.map((sub: any) => ({
        ...sub,
        projectId: project.projectId,
        tab: 'ISPO' // hardcoded or dynamically assignable
      }))
    );
    this.rawData.set(flat);

    const groupedContracts = this.groupByProjectId(data);
    this.contractsData.set(groupedContracts);
  });
}


  private groupByProjectId(data: any[]): any[] {
  return data.map(project => ({
    key: project.projectId,
    name: `${project.projectId} - ${project.subProjects?.[0]?.activityName || ' '}`,
    icon: 'folder',
    children: project.subProjects?.map((activity: any) => ({
      key: activity.activityId,
      name: activity.activityName,
      icon: 'file'
    })) || []
  }));
}
onProjectSelectionChange(selectedProjectIds: string[]) {
  this.selectedContracts.set(selectedProjectIds);
}

updateSelectedContracts(projectIds: string[]) {
  this.selectedContracts.set(projectIds);
}

  onTabSelect(e: any) {
    this.selectedTab.set(this.tabs[e.index]);
  }

  filteredData = computed(() => {
  return this.rawData().filter(row =>
    row.tab === this.selectedTab() &&
    (!this.viewAsFilter() || row.viewAs === this.viewAsFilter()) &&
    (!this.functionFilter() || row.functions.includes(this.functionFilter())) &&
    (!this.documentTypeFilter() || row.documentType === this.documentTypeFilter()) &&
    (!this.activityStatusFilter() || row.activityStatus === this.activityStatusFilter()) &&
    (!this.activityTypeFilter() || row.activityType === this.activityTypeFilter()) &&
    (!this.finishByFilter() || row.finishBy === this.finishByFilter()) &&
    (this.selectedContracts().length === 0 || this.selectedContracts().includes(row.projectId)) &&
    (!this.searchText() || Object.values(row).some(val =>
      String(val).toLowerCase().includes(this.searchText().toLowerCase())))
  );
});



  handleFilterChange(filters: any) {
    this.viewAsFilter.set(filters.viewAs);
    this.functionFilter.set(filters.functions);
    this.documentTypeFilter.set(filters.documentType);
    this.activityStatusFilter.set(filters.activityStatus);
    this.activityTypeFilter.set(filters.activityType);
    this.finishByFilter.set(filters.finishBy);
    this.dateTypeFilter.set(filters.dateType);
  }

  toggleProfileMenu() {
    this.profileMenuVisible = !this.profileMenuVisible;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  openPopup(type: string) {
    this.popup = type;
    this.profileMenuVisible = false;
  }

  closePopup() {
    this.popup = null;
    this.router.navigate(['/dashboard']);
  }
}
