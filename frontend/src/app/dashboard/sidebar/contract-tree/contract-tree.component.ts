import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeViewModule } from '@progress/kendo-angular-treeview';

@Component({
  selector: 'app-contract-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeViewModule],
  templateUrl: './contract-tree.component.html',
  styleUrls: ['./contract-tree.component.scss']
})
export class ContractTreeComponent {
  @Input() contractsData: any[] = [];
  @Output() selectedProjects = new EventEmitter<string[]>();

  checkedKeys: any[] = [];
  searchQueryValue: string = '';
  selectedTab = signal('My Contracts');
  favourites = signal<Set<string>>(new Set());
  sidebarCollapsed = signal(false);
  projectListCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleProjectList() {
    this.projectListCollapsed.set(!this.projectListCollapsed());
  }

  setTab(tab: string) {
    this.selectedTab.set(tab);
  }

  toggleFavourite(contract: any, event: MouseEvent) {
    event.stopPropagation();
    const favs = new Set(this.favourites());
    favs.has(contract.key) ? favs.delete(contract.key) : favs.add(contract.key);
    this.favourites.set(favs);
  }

  isFavourite(contract: any): boolean {
    return this.favourites().has(contract.key);
  }

  get filteredContracts() {
    const search = this.searchQueryValue.toLowerCase();
    const tab = this.selectedTab();

    return this.contractsData.filter(contract => {
      const nameMatch = contract.name.toLowerCase().includes(search) ||
        contract.children?.some((c: any) => c.name.toLowerCase().includes(search));
      if (!nameMatch) return false;

      if (tab === 'My Contracts') return contract.myContract;
      if (tab === 'Favourites') return this.favourites().has(contract.key);
      return true;
    });
  }

  ngOnChanges() {
    this.emitSelectedProjectIds();
  }

  emitSelectedProjectIds() {
    const selectedProjectIds = this.checkedKeys.filter(key =>
      this.contractsData.some(contract => contract.key === key)
    );
    this.selectedProjects.emit(selectedProjectIds);
  }

  ngDoCheck() {
    this.emitSelectedProjectIds(); // Always emit when project selection changes
  }
}
