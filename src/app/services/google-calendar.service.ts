import { Injectable } from '@angular/core';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private gapiInitialized = false;

  async init(clientId: string): Promise<void> {
    if (this.gapiInitialized) return;
    await new Promise(resolve => gapi.load('client:auth2', resolve));
    await gapi.client.init({
      apiKey: '', // Optional, not needed for calendar insert
      clientId,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar.events'
    });
    this.gapiInitialized = true;
  }

  async signIn(): Promise<void> {
    await gapi.auth2.getAuthInstance().signIn();
  }

  async addEvent(event: any): Promise<any> {
    return gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
  }
}
