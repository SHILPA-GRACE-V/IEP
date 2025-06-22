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

  /* ───────── Inputs / Outputs ───────── */
  @Input()  contractsData: any[] = [];
  @Output() emitSelectedProjectIds = new EventEmitter<string[]>();

  /* ───────── Reactive state ───────── */
  searchQueryValue = '';
  checkedKeys: string[] = [];

  selectedTab      = signal('My Contracts');
  favourites       = signal<Set<string>>(new Set());
  sidebarCollapsed = signal(false);
  projectListCollapsed = signal(false);
  showAdvancedSearch  = false;

  expandedProjects  = new Set<string>();   // level-0
  expandedLevel1    = new Set<string>();   // new: level-1

  /* ───────── UI toggles ───────── */
  toggleSidebar()        { this.sidebarCollapsed.set(!this.sidebarCollapsed()); }
  toggleProjectList()    { this.projectListCollapsed.set(!this.projectListCollapsed()); }
  toggleAdvancedSearch() { this.showAdvancedSearch = !this.showAdvancedSearch; }
  setTab(t:string)       { this.selectedTab.set(t); }

  toggleFavourite(pid:string){
    const s=new Set(this.favourites());
    s.has(pid) ? s.delete(pid) : s.add(pid);
    this.favourites.set(s);
  }

  toggleExpanded(pid:string){
    this.expandedProjects.has(pid) ? this.expandedProjects.delete(pid)
                                   : this.expandedProjects.add(pid);
  }
  /** level-1 toggle */
  toggleExpandedLevel1(id:string){
    this.expandedLevel1.has(id) ? this.expandedLevel1.delete(id)
                                : this.expandedLevel1.add(id);
  }

  /* ───────── Recursively gather IDs ───────── */
  private collectIds(node:any): string[]{
    const list:string[]=[];
    if(node.activityId) list.push(node.activityId);
    const kids = node.subProjects
               ?? node.subProjectsLevel2
               ?? node.subProjectsLevel3
               ?? [];
    kids.forEach((k:any)=> list.push(...this.collectIds(k)));
    return list;
  }

  /* ───────── Checkbox handling ───────── */
  toggleChecked(id:string){
    const idx=this.checkedKeys.indexOf(id);
    idx>=0 ? this.checkedKeys.splice(idx,1) : this.checkedKeys.push(id);
    this.onSelectionChange();
  }

  // onSelectionChange(){
  //   const selected=this.checkedKeys.filter(k=>k.length===7);
  //   this.emitSelectedProjectIds.emit(selected);
  // }

onSelectionChange(): void {
  const selected: string[] = [];

  for (const project of this.contractsData) {
    /* all activity IDs belonging to this project (any depth) */
    const ids = project.subProjects.flatMap((sp: any) => this.collectIds(sp));

    /* if one of those IDs is checked -> include this project */
    if (ids.some((id: string) => this.checkedKeys.includes(id))) {
      selected.push(project.projectId);
    }
  }

  this.emitSelectedProjectIds.emit(selected);
}


  isPartiallyChecked(p:any){
    const all = p.subProjects.flatMap((sp:any)=> this.collectIds(sp));
    const hit = all.filter((id:string)=> this.checkedKeys.includes(id));
    return hit.length>0 && hit.length<all.length;
  }
  areAllSubprojectsChecked(p:any){
    const all = p.subProjects.flatMap((sp:any)=> this.collectIds(sp));
    return all.every((id:string)=> this.checkedKeys.includes(id));
  }

  toggleAllSubprojects(ev:Event,p:any){
    ev.stopPropagation();
    const all = p.subProjects.flatMap((sp:any)=> this.collectIds(sp));
    const checked = (ev.target as HTMLInputElement).checked;
    this.checkedKeys = checked
      ? Array.from(new Set([...this.checkedKeys, ...all]))
      : this.checkedKeys.filter(id=>!all.includes(id));
    this.onSelectionChange();
  }

  areAllProjectsChecked():boolean{
    const all=this.filteredContracts
      .flatMap(prj=>prj.subProjects.flatMap((sp:any)=> this.collectIds(sp)));
    return all.length>0 && all.every((id:string)=> this.checkedKeys.includes(id));
  }
  toggleAllProjects(ev:Event){
    const checked=(ev.target as HTMLInputElement).checked;
    const all=this.filteredContracts
      .flatMap(prj=>prj.subProjects.flatMap((sp:any)=> this.collectIds(sp)));
    this.checkedKeys = checked
      ? Array.from(new Set([...this.checkedKeys, ...all]))
      : this.checkedKeys.filter(id=>!all.includes(id));
    this.onSelectionChange();
  }

  /* ───────── Search / filter ───────── */
  get filteredContracts():any[]{
    const q=this.searchQueryValue.trim().toLowerCase();
    let list=this.contractsData;

    if(this.selectedTab()==='Favourites'){
      list=list.filter(p=> this.favourites().has(p.projectId));
    }
    if(!q) return list;

    const match=(s:string)=> s?.toLowerCase().includes(q);
    return list.filter(p =>
      match(p.treePath) ||
      p.subProjects?.some((sp:any)=>
        match(sp.activityName) ||
        sp.subProjectsLevel2?.some((s2:any)=>
          match(s2.activityName) ||
          s2.subProjectsLevel3?.some((s3:any)=> match(s3.activityName))
        )
      )
    );
  }
}
