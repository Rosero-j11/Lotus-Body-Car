import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../utils/cn.util';

@Component({
  selector: 'app-label',
  imports: [CommonModule],
  templateUrl: './label.html',
  styleUrl: './label.css'
})
export class LabelComponent {
  @Input() for: string = '';
  @Input() className: string = '';

  labelClass() {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.className
    );
  }
}
