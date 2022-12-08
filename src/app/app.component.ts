import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Environment } from '@ionic-native/google-maps';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      Environment.setEnv({
        // api key for server
        'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyA69cowvNu9IzizFwsy8nmzbycmliL6F9E',

        // api key for local development
        'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyA69cowvNu9IzizFwsy8nmzbycmliL6F9E'
      });

    });
  }
}
