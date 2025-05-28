import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes as appRoutes } from './app/app.routes'; // Assuming app.routes.ts exists for routing

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes) // Provide router configuration
    // Other global providers can go here
  ]
}).catch(err => console.error(err));

