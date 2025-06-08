import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-search-box',
  imports: [CommonModule, InputsModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
  @Input() search = signal('');
}
