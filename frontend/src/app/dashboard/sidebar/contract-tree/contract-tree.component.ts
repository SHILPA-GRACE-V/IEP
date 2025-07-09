import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contract-tree',
  standalone: true,
  templateUrl: './contract-tree.component.html',
  styleUrls: ['./contract-tree.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ContractTreeComponent {

  @Input() contractsData: any[] = [];
  @Output() emitSelectedProjectIds = new EventEmitter<string[]>();

  searchQueryValue = '';
  checkedKeys: string[] = [];

  selectedTab = signal('My Contracts');
  favourites = signal<Set<string>>(new Set());
  sidebarCollapsed = signal(false);
  projectListCollapsed = signal(true);
  showAdvancedSearch = false;

  expandedProjects = new Set<string>();
  expandedLevel1 = new Set<string>();

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleProjectList() {
    this.projectListCollapsed.set(!this.projectListCollapsed());
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  setTab(tab: string) {
    this.selectedTab.set(tab);
  }

  toggleFavourite(pid: string) {
    const favs = new Set(this.favourites());
    favs.has(pid) ? favs.delete(pid) : favs.add(pid);
    this.favourites.set(favs);
  }

  toggleExpanded(pid: string) {
    this.expandedProjects.has(pid)
      ? this.expandedProjects.delete(pid)
      : this.expandedProjects.add(pid);
  }

  toggleExpandedLevel1(id: string) {
    this.expandedLevel1.has(id)
      ? this.expandedLevel1.delete(id)
      : this.expandedLevel1.add(id);
  }

  /** Recursively collect all activity IDs */
  private collectIds(node: any): string[] {
    const ids: string[] = [];
    if (node.activityId) ids.push(node.activityId);

    const children = node.subProjectsLevel3 || node.subProjectsLevel2 || node.subProjects || [];
    for (const child of children) {
      ids.push(...this.collectIds(child));
    }

    return ids;
  }

  /** Recursively find a node and get its subtree IDs */
  private findAllIdsByActivityId(id: string): string[] {
    const result: string[] = [];

    const traverse = (node: any): boolean => {
      if (node.activityId === id) {
        result.push(...this.collectIds(node));
        return true;
      }
      const children = node.subProjects || node.subProjectsLevel2 || node.subProjectsLevel3 || [];
      return children.some(traverse);
    };

    this.contractsData.forEach(project => {
      project.subProjects?.some(traverse);
    });

    return result;
  }

  toggleChecked(id: string) {
    const isChecked = this.checkedKeys.includes(id);
    const affectedIds = this.findAllIdsByActivityId(id);

    this.checkedKeys = isChecked
      ? this.checkedKeys.filter(k => !affectedIds.includes(k))
      : [...new Set([...this.checkedKeys, ...affectedIds])];

    this.onSelectionChange();
  }

  onSelectionChange() {
    this.emitSelectedProjectIds.emit([...this.checkedKeys]);
  }

  isPartiallyChecked(node: any): boolean {
    const all = this.collectIds(node);
    const selected = all.filter(id => this.checkedKeys.includes(id));
    return selected.length > 0 && selected.length < all.length;
  }

  areAllSubprojectsChecked(node: any): boolean {
    const all = this.collectIds(node);
    return all.length > 0 && all.every(id => this.checkedKeys.includes(id));
  }

  toggleAllSubprojects(ev: Event, node: any) {
    ev.stopPropagation();
    const all = this.collectIds(node);
    const checked = (ev.target as HTMLInputElement).checked;

    this.checkedKeys = checked
      ? [...new Set([...this.checkedKeys, ...all])]
      : this.checkedKeys.filter(id => !all.includes(id));

    this.onSelectionChange();
  }

  areAllProjectsChecked(): boolean {
    const all = this.filteredContracts
      .flatMap(p => p.subProjects?.flatMap((sp: any) => this.collectIds(sp)) ?? []);
    return all.length > 0 && all.every(id => this.checkedKeys.includes(id));
  }

  toggleAllProjects(ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const all = this.filteredContracts
      .flatMap(p => p.subProjects?.flatMap((sp: any) => this.collectIds(sp)) ?? []);

    this.checkedKeys = checked
      ? [...new Set([...this.checkedKeys, ...all])]
      : this.checkedKeys.filter(id => !all.includes(id));

    this.onSelectionChange();
  }

  get filteredContracts(): any[] {
    const q = this.searchQueryValue.trim().toLowerCase();
    let list = this.contractsData;

    if (this.selectedTab() === 'Favourites') {
      list = list.filter(p => this.favourites().has(p.projectId));
    }

    if (!q) return list;

    const match = (s: string) => s?.toLowerCase().includes(q);
    return list.filter(p =>
      match(p.treePath) ||
      p.subProjects?.some((sp: any) =>
        match(sp.activityName) ||
        sp.subProjectsLevel2?.some((s2: any) =>
          match(s2.activityName) ||
          s2.subProjectsLevel3?.some((s3: any) => match(s3.activityName))
        )
      )
    );
  }
}
