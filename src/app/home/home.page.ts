import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { myConstants } from '../services/contants';

declare var google: {
  maps: {
    places: {
      AutocompleteSessionToken: new () => string; AutocompleteService: new () => any;
    };
    Geocoder: new () => any; GeocoderStatus: { OK: any; };
    LatLng: new (arg0: number, arg1: number) => any;
    Map: new (arg0: HTMLElement, arg1: { zoom: number; center: any; }) => any;
    Marker: new (arg0: { map: any; position: any; }) => any;
  };
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: any;
  map: any;
  autocomplete: { input: string; };
  autocompleteService: any;
  geocoder: any;
  selectedItem: string;
  sessionToken: string;
  showImage = true;
  destinationCity: string;
  address: string;
  running = false;


  // construction
  constructor(
    private platform: Platform,
  ) {
    this.initPage()
  }

  //initialize the objectes here
  async initPage() {
    await this.platform.ready();
    this.geocoder = Geolocation;

    // Create a new session token.
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.items = [];
    this.autocomplete = {
      input: ''
    };
  }

  /**
   * here we are getting latlng of chosen place and show it on map.
   * @param item User chosen place.
   */
  loadMap(item: any) {

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item['description'] }, (results, status) => {
      if (results[0]) {
        if (status == google.maps.GeocoderStatus.OK) {
          var latlng = new google.maps.LatLng(myConstants.latitude, myConstants.longitude);
          var mapOptions =
          {
            zoom: myConstants.zoomCameraVal,
            center: latlng
          }
          this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
          this.map.setCenter(results[0].geometry.location);//center the map over the result
          //place a marker at the location
          new google.maps.Marker(
            {
              map: this.map,
              position: results[0].geometry.location
            });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      }else{
        alert('Something went wrong!. Please try again.');
      }
    });
  }

  //When User Remove/Dismiss the entered keywords from searchBar. Image will appear again
  dismiss() {
    this.resetViewToInitialState();
    this.autocomplete = {
      input: ''
    };

  }

  /**
   * 
   * @param formatText For Formating Searched Places list Items
   */
  formatDestinationCity(formatText: any) {

    if (formatText.secondary_text.indexOf(',') > 0) {
      let lieuSplitted = formatText.secondary_text.split(',', 1);
      this.destinationCity = lieuSplitted[0]
    }
    else {
      this.destinationCity = formatText.main_text
    }
  }

  /**
   * Function called when user choose a place from the lsit
   * @param item User Chosen Place
   */
  chooseItem(item: any) {
    this.showImage = false;
    this.running = true;
    this.selectedItem = item;
    this.items = [];
    this.autocomplete.input = item.structured_formatting.main_text + ' - ' + item.structured_formatting.secondary_text;
    this.formatDestinationCity(item.structured_formatting);
    this.loadMap(item);

  }

  //Reset flags
  resetViewToInitialState() {
    this.items = [];
    this.showImage = true;
    this.running = false;
  }

  //This function will populate the list with places according to searched keyword.
  updateSearch() {
    if (this.autocomplete.input == '') {
      this.resetViewToInitialState();
      return;
    }
    if (!this.running) {
      let self = this;
      this.autocompleteService.getPlacePredictions(
        {
          types: ['geocode'], input: this.autocomplete.input
        },
        function (predictions, status) {
          self.items = [];
          if (predictions) {
            predictions.forEach(function (prediction) {
              self.items.push(prediction);
            });
          }
        });
    }
  }
}
