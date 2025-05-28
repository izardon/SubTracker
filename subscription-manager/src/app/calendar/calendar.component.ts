import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Subscription, SubscriptionService } from '../subscription.service'; // Adjusted path
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component'; // Import SubscriptionFormComponent

interface CalendarDay {
  dateObj: Date;
  dateNumber: number;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true, // Marking as standalone
  imports: [CommonModule, FormsModule, SubscriptionFormComponent] // Add imports here for standalone
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  daysInMonthGrid: CalendarDay[] = []; // For the grid display

  selectedDate: Date | null = null;
  subscriptionsForSelectedDate: Subscription[] = [];
  showSubscriptionForm: boolean = false;
  editingSubscription: Subscription | null = null;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.generateCalendarGrid();
  }

  generateCalendarGrid(): void {
    this.daysInMonthGrid = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Add days from previous month for padding
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, 0 - i); // Calculate days from previous month
      this.daysInMonthGrid.unshift({ // Add to the beginning
        dateObj: prevMonthDay,
        dateNumber: prevMonthDay.getDate(),
        isCurrentMonth: false,
        subscriptions: this.subscriptionService.getSubscriptionsByDate(prevMonthDay)
      });
    }
    
    // Add days of the current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      this.daysInMonthGrid.push({
        dateObj: dayDate,
        dateNumber: i,
        isCurrentMonth: true,
        subscriptions: this.subscriptionService.getSubscriptionsByDate(dayDate)
      });
    }

    // Add days from next month for padding
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const remainingCells = 6 - lastDayOfWeek; // Number of cells to fill for the next month
    if (remainingCells > 0 && this.daysInMonthGrid.length % 7 !== 0) { // Ensure grid completes rows
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDay = new Date(year, month + 1, i);
            this.daysInMonthGrid.push({
            dateObj: nextMonthDay,
            dateNumber: nextMonthDay.getDate(),
            isCurrentMonth: false,
            subscriptions: this.subscriptionService.getSubscriptionsByDate(nextMonthDay)
            });
        }
    }
    // Ensure the grid is a multiple of 7, if not already handled adequately
     while(this.daysInMonthGrid.length < 35) { // Pad to 5 weeks minimum, can be 42 for 6 weeks
        const lastDate = this.daysInMonthGrid[this.daysInMonthGrid.length-1].dateObj;
        const nextDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1);
         this.daysInMonthGrid.push({
            dateObj: nextDay,
            dateNumber: nextDay.getDate(),
            isCurrentMonth: false, // Assuming these are padding days from next month
            subscriptions: this.subscriptionService.getSubscriptionsByDate(nextDay)
         });
     }

  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendarGrid();
    this.selectedDate = null; // Reset selection when month changes
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarGrid();
    this.selectedDate = null; // Reset selection when month changes
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }

  onDateClick(day: CalendarDay): void {
    if (!day.isCurrentMonth && this.currentMonth.getMonth() === day.dateObj.getMonth()) {
        // This handles edge case where padding days might still be in the logical current month (e.g. Feb 29 on non-leap year displayed in March grid)
        // Or if padding days from prev/next month are clicked, switch to that month
        this.currentMonth = new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), 1);
        this.generateCalendarGrid(); // Regenerate grid for the new month
    }
    // Always set selectedDate to the actually clicked day's dateObj
    this.selectedDate = day.dateObj; 
    this.loadSubscriptionsForDate(this.selectedDate);
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }

  loadSubscriptionsForDate(date: Date): void {
    this.subscriptionsForSelectedDate = this.subscriptionService.getSubscriptionsByDate(date);
  }

  getSubscriptionsForCell(date: Date): Subscription[] {
    return this.subscriptionService.getSubscriptionsByDate(date);
  }

  showAddForm(): void {
    if (!this.selectedDate) {
        // Optionally, handle the case where no date is selected, e.g., alert user or default to today
        console.warn('No date selected to add subscription to. Defaulting to today or prompting user.');
        this.selectedDate = new Date(); // Example: default to today
        this.loadSubscriptionsForDate(this.selectedDate); // Load for this new selected date
    }
    this.editingSubscription = null;
    this.showSubscriptionForm = true;
  }

  showEditForm(subscription: Subscription): void {
    this.editingSubscription = subscription;
    this.showSubscriptionForm = true;
  }

  handleSaveSubscription(subscriptionEventData: Subscription): void {
    if (!this.selectedDate && !this.editingSubscription) {
      console.error('Cannot save: No selected date for new subscription.');
      return;
    }

    if (this.editingSubscription) {
      // Update existing subscription
      // The event data from form might not have ID or full paymentDate, merge carefully
      const updatedSub: Subscription = {
        ...this.editingSubscription, // Existing ID and paymentDate
        name: subscriptionEventData.name,
        price: subscriptionEventData.price,
        cycle: subscriptionEventData.cycle
        // paymentDate is NOT updated from the form's output, it's fixed for the subscription
      };
      this.subscriptionService.updateSubscription(updatedSub);
    } else if (this.selectedDate) {
      // Add new subscription
      this.subscriptionService.addSubscription(
        { name: subscriptionEventData.name, price: subscriptionEventData.price, cycle: subscriptionEventData.cycle },
        this.selectedDate // The paymentDate is the selectedDate for new subscriptions
      );
    }
    
    if (this.selectedDate) {
        this.loadSubscriptionsForDate(this.selectedDate);
    }
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }

  handleCancelSubscriptionForm(): void {
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }

  handleDeleteSubscription(subscriptionId: string): void {
    if (this.selectedDate) {
      this.subscriptionService.deleteSubscription(subscriptionId);
      this.loadSubscriptionsForDate(this.selectedDate);
    }
    this.showSubscriptionForm = false;
    this.editingSubscription = null;
  }
}

