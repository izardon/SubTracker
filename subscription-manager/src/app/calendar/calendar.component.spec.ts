import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CalendarComponent } from './calendar.component';
import { Subscription, SubscriptionService } from '../subscription.service'; // Adjusted path
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionFormComponent } from '../subscription-form/subscription-form.component';

// Mock SubscriptionService
class MockSubscriptionService {
  subscriptions: Subscription[] = [];

  getSubscriptionsByDate(date: Date): Subscription[] {
    return this.subscriptions.filter(sub => 
      sub.paymentDate.getFullYear() === date.getFullYear() &&
      sub.paymentDate.getMonth() === date.getMonth() &&
      sub.paymentDate.getDate() === date.getDate()
    );
  }

  // Add other methods if needed by the component, e.g., addSubscription, etc.
  // For this test suite, getSubscriptionsByDate is the primary concern for display.
}

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let mockSubscriptionService: MockSubscriptionService;

  beforeEach(async () => {
    mockSubscriptionService = new MockSubscriptionService();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, // Import if your component's template uses common directives like *ngFor, *ngIf
        FormsModule,  // Import if your component uses FormsModule features like ngModel
        CalendarComponent, // CalendarComponent is standalone
        // SubscriptionFormComponent // Already imported by CalendarComponent as it's standalone
      ],
      providers: [
        { provide: SubscriptionService, useValue: mockSubscriptionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    // ngOnInit is called automatically, which calls generateCalendarGrid
    // If you need to override subscriptions before ngOnInit, setup mockSubscriptionService.subscriptions here
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Subscription Display in Calendar Grid', () => {
    beforeEach(() => {
      // Set currentMonth to a fixed date for predictable testing
      component.currentMonth = new Date(2024, 6, 1); // July 2024
      // Clear any subscriptions from previous tests
      mockSubscriptionService.subscriptions = []; 
    });

    it('should display subscription name and color square for a day in current month with subscriptions', () => {
      const testDate = new Date(2024, 6, 15); // July 15, 2024
      const mockSub: Subscription = { id: '1', name: 'Netflix', price: 15, cycle: 'monthly', paymentDate: testDate };
      mockSubscriptionService.subscriptions.push(mockSub);

      component.generateCalendarGrid(); // Regenerate grid with new sub data
      fixture.detectChanges();

      const dayCellElement = fixture.debugElement.queryAll(By.css('.day-cell'))
        .find(cell => {
          const dayNumber = cell.query(By.css('span'))?.nativeElement.textContent.trim();
          return cell.classes['current-month'] && dayNumber === '15';
        });

      expect(dayCellElement).withContext('Day cell for July 15th not found').toBeTruthy();
      
      const subscriptionsList = dayCellElement!.query(By.css('.subscriptions-list'));
      expect(subscriptionsList).withContext('Subscriptions list not found for July 15th').toBeTruthy();
      
      const subscriptionItem = subscriptionsList!.query(By.css('.subscription-item'));
      expect(subscriptionItem).withContext('Subscription item not found').toBeTruthy();
      
      const colorSquare = subscriptionItem!.query(By.css('.subscription-color-square'));
      expect(colorSquare).withContext('Color square not found').toBeTruthy();
      
      const subscriptionName = subscriptionItem!.query(By.css('.subscription-name'));
      expect(subscriptionName).withContext('Subscription name not found').toBeTruthy();
      expect(subscriptionName!.nativeElement.textContent).toContain('Netflix');
    });

    it('should display multiple subscriptions for a day in current month', () => {
      const testDate = new Date(2024, 6, 18); // July 18, 2024
      const mockSub1: Subscription = { id: '1', name: 'Spotify', price: 10, cycle: 'monthly', paymentDate: testDate };
      const mockSub2: Subscription = { id: '2', name: 'HBO Max', price: 15, cycle: 'monthly', paymentDate: testDate };
      mockSubscriptionService.subscriptions.push(mockSub1, mockSub2);

      component.generateCalendarGrid();
      fixture.detectChanges();

      const dayCellElement = fixture.debugElement.queryAll(By.css('.day-cell'))
        .find(cell => cell.classes['current-month'] && cell.query(By.css('span'))?.nativeElement.textContent.trim() === '18');
      
      expect(dayCellElement).withContext('Day cell for July 18th not found').toBeTruthy();
      const subscriptionItems = dayCellElement!.queryAll(By.css('.subscription-item'));
      expect(subscriptionItems.length).withContext('Incorrect number of subscription items').toBe(2);
      expect(subscriptionItems[0].query(By.css('.subscription-name'))!.nativeElement.textContent).toContain('Spotify');
      expect(subscriptionItems[1].query(By.css('.subscription-name'))!.nativeElement.textContent).toContain('HBO Max');
    });

    it('should NOT display subscription elements for a day in current month without subscriptions', () => {
      component.currentMonth = new Date(2024, 6, 1); // July 2024
      // No subscriptions added to mockSubscriptionService

      component.generateCalendarGrid();
      fixture.detectChanges();
      
      // Check day 10 (arbitrary day, ensure it's within the month)
      const dayCellElement = fixture.debugElement.queryAll(By.css('.day-cell'))
        .find(cell => cell.classes['current-month'] && cell.query(By.css('span'))?.nativeElement.textContent.trim() === '10');

      expect(dayCellElement).withContext('Day cell for July 10th not found').toBeTruthy();
      const subscriptionsList = dayCellElement!.query(By.css('.subscriptions-list'));
      expect(subscriptionsList).withContext('Subscriptions list should NOT be present for July 10th').toBeFalsy();
    });

    it('should NOT display subscription elements for a padding day (other month) even if it has subscriptions', () => {
      // July 2024 starts on a Monday. So, June 30th (Sunday) will be a padding day.
      component.currentMonth = new Date(2024, 6, 1); // July 2024
      const prevMonthDate = new Date(2024, 5, 30); // June 30, 2024
      const mockSub: Subscription = { id: '3', name: 'PaddingSub', price: 5, cycle: 'monthly', paymentDate: prevMonthDate };
      mockSubscriptionService.subscriptions.push(mockSub);

      component.generateCalendarGrid();
      fixture.detectChanges();
      
      // Find the cell for June 30th (it will be an "other-month" cell)
      const paddingDayCellElement = fixture.debugElement.queryAll(By.css('.day-cell'))
      .find(cell => {
        const dayNumber = cell.query(By.css('span'))?.nativeElement.textContent.trim();
        // Check if it's an "other-month" cell and the date number matches
        return cell.classes['other-month'] && dayNumber === '30';
      });
      
      expect(paddingDayCellElement).withContext('Padding day cell for June 30th not found').toBeTruthy();
      // Ensure it is indeed an "other-month" cell
      expect(paddingDayCellElement!.classes['other-month']).toBeTrue();

      const subscriptionsList = paddingDayCellElement!.query(By.css('.subscriptions-list'));
      expect(subscriptionsList).withContext('Subscriptions list should NOT be present for padding day June 30th').toBeFalsy();
    });
  });
});
