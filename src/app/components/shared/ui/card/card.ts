import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../utils/cn.util';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class CardComponent {
  @Input() className: string = '';

  cardClass() {
    return cn(
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
      this.className
    );
  }
}

@Component({
  selector: 'app-card-header',
  imports: [CommonModule],
  template: `<div [attr.data-slot]="'card-header'" [class]="headerClass()"><ng-content></ng-content></div>`
})
export class CardHeaderComponent {
  @Input() className: string = '';
  
  headerClass() {
    return cn(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      this.className
    );
  }
}

@Component({
  selector: 'app-card-title',
  imports: [CommonModule],
  template: `<h4 [attr.data-slot]="'card-title'" [class]="titleClass()"><ng-content></ng-content></h4>`
})
export class CardTitleComponent {
  @Input() className: string = '';
  
  titleClass() {
    return cn('leading-none', this.className);
  }
}

@Component({
  selector: 'app-card-description',
  imports: [CommonModule],
  template: `<p [attr.data-slot]="'card-description'" [class]="descClass()"><ng-content></ng-content></p>`
})
export class CardDescriptionComponent {
  @Input() className: string = '';
  
  descClass() {
    return cn('text-muted-foreground', this.className);
  }
}

@Component({
  selector: 'app-card-content',
  imports: [CommonModule],
  template: `<div [attr.data-slot]="'card-content'" [class]="contentClass()"><ng-content></ng-content></div>`
})
export class CardContentComponent {
  @Input() className: string = '';
  
  contentClass() {
    return cn('px-6 [&:last-child]:pb-6', this.className);
  }
}

@Component({
  selector: 'app-card-footer',
  imports: [CommonModule],
  template: `<div [attr.data-slot]="'card-footer'" [class]="footerClass()"><ng-content></ng-content></div>`
})
export class CardFooterComponent {
  @Input() className: string = '';
  
  footerClass() {
    return cn('flex items-center px-6 pb-6 [.border-t]:pt-6', this.className);
  }
}
