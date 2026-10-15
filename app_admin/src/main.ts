import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { BROWSER_STORAGE } from './app/storage';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    { provide: BROWSER_STORAGE, useValue: localStorage }
  ]
});