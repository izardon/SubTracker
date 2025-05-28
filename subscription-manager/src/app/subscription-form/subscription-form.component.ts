import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from '../subscription.service'; // Adjusted path

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss'],
})
export class SubscriptionFormComponent implements OnInit {
  @Input() subscription: Subscription | null = null;
  @Input() selectedDate: Date | null = null; // For new subscriptions
  @Output() save = new EventEmitter<Subscription>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>(); // Emits subscription ID

  formData: {
    name: string;
    price: number | null;
    cycle: 'monthly' | 'yearly' | 'weekly';
  } = {
    name: '',
    price: null,
    cycle: 'monthly'
  };

  constructor() { }

  ngOnInit(): void {
    if (this.subscription) {
      this.formData = {
        name: this.subscription.name,
        price: this.subscription.price,
        cycle: this.subscription.cycle
      };
    } else {
      // Initialize with default values or leave as is
      this.formData = { name: '', price: null, cycle: 'monthly' };
    }
  }

  onSave(): void {
    if (!this.formData.name || !this.formData.price || this.formData.price <= 0) {
      // Basic validation: name is required, price must be a positive number
      console.error('Validation failed: Name and positive price are required.');
      return;
    }

    let paymentDateToUse: Date;
    if (this.subscription) { // Editing existing subscription
        paymentDateToUse = this.subscription.paymentDate;
    } else if (this.selectedDate) { // Creating new subscription
        paymentDateToUse = this.selectedDate;
    } else {
        console.error('Cannot save: No date provided for new subscription.');
        return; // Or handle this error appropriately
    }
    
    const subscriptionData: Subscription = {
      id: this.subscription ? this.subscription.id : '', // ID will be set by service for new ones
      name: this.formData.name,
      price: this.formData.price,
      cycle: this.formData.cycle,
      paymentDate: paymentDateToUse
    };
    this.save.emit(subscriptionData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    if (this.subscription && this.subscription.id) {
      this.delete.emit(this.subscription.id);
    }
  }
}

