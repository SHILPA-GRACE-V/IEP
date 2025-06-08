import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  imports: [CommonModule, GridModule, FormsModule],
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss']
})
export class ActivityGridComponent {
  @Input() data: any[] = [];
  globalSearch: string = '';

  get filteredGridData(): any[] {
    const term = this.globalSearch.toLowerCase();
    return this.data.filter(item =>
      !term ||
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }
}
