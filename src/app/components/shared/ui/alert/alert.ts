import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../utils/cn.util';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type AlertVariants = VariantProps<typeof alertVariants>;

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class AlertComponent {
  @Input() variant: AlertVariants['variant'] = 'default';
  @Input() className: string = '';

  alertClass() {
    return cn(alertVariants({ variant: this.variant, className: this.className }));
  }
}

@Component({
  selector: 'app-alert-title',
  imports: [CommonModule],
  template: `<h5 [class]="titleClass()"><ng-content></ng-content></h5>`
})
export class AlertTitleComponent {
  @Input() className: string = '';
  
  titleClass() {
    return cn('mb-1 font-medium leading-none tracking-tight', this.className);
  }
}

@Component({
  selector: 'app-alert-description',
  imports: [CommonModule],
  template: `<div [class]="descClass()"><ng-content></ng-content></div>`
})
export class AlertDescriptionComponent {
  @Input() className: string = '';
  
  descClass() {
    return cn('text-sm [&_p]:leading-relaxed', this.className);
  }
}
