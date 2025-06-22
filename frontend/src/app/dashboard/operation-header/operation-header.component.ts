import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector   : 'app-operation-header',
  standalone : true,
  imports    : [CommonModule],
  templateUrl: './operation-header.component.html',
  styleUrls  : ['./operation-header.component.scss']
})
export class OperationHeaderComponent { }
