import { Injectable } from '@angular/core';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  cycle: 'monthly' | 'yearly' | 'weekly';
  paymentDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private subscriptions: Subscription[] = [];
  private nextId = 1; // Simple counter for unique IDs

  constructor() { }

  addSubscription(subscriptionData: Omit<Subscription, 'id' | 'paymentDate'>, paymentDate: Date): Subscription {
    const newSubscription: Subscription = {
      id: this.nextId.toString(),
      name: subscriptionData.name,
      price: subscriptionData.price,
      cycle: subscriptionData.cycle,
      paymentDate: paymentDate
    };
    this.nextId++;
    this.subscriptions.push(newSubscription);
    return newSubscription;
  }

  getSubscriptionsByDate(date: Date): Subscription[] {
    return this.subscriptions.filter(sub => {
      const subDate = sub.paymentDate;
      return subDate.getFullYear() === date.getFullYear() &&
             subDate.getMonth() === date.getMonth() &&
             subDate.getDate() === date.getDate();
    });
  }

  updateSubscription(updatedSubscription: Subscription): Subscription | null {
    const index = this.subscriptions.findIndex(sub => sub.id === updatedSubscription.id);
    if (index !== -1) {
      this.subscriptions[index] = updatedSubscription;
      return updatedSubscription;
    }
    return null;
  }

  deleteSubscription(id: string): boolean {
    const initialLength = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
    return this.subscriptions.length < initialLength;
  }
}

