import { Component } from '@angular/core';
import { CalendarComponent } from './calendar/calendar.component'; // Ensure path is correct

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true, // Make app.component standalone
  imports: [CalendarComponent] // Import CalendarComponent here
})
export class AppComponent {
  title = 'subscription-manager';
}

