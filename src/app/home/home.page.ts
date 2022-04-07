import { Component, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var google: { maps: { places: { AutocompleteSessionToken: new () => string; AutocompleteService: new () => any; }; Geocoder: new () => any; GeocoderStatus: { OK: any; }; LatLng: new (arg0: number, arg1: number) => any; Map: new (arg0: HTMLElement, arg1: { zoom: number; center: any; }) => any; Marker: new (arg0: { map: any; position: any; }) => any; }; };

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: any;
  map: any;
  autocomplete: { input: string; };
  acService: any;
  geocoder: any;
  selectedItem: string;
  sessionToken: string;
  showImage = true;
  destinationCity: string;
  address: string;
  running = false;

  constructor(
    public toastCtrl: ToastController,
    private platform: Platform,
    public zone: NgZone,
  ) {
    this.initPage()
  }
  async initPage() {
    await this.platform.ready();
    this.geocoder = Geolocation;

    // Create a new session token.
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    this.acService = new google.maps.places.AutocompleteService();
    this.items = [];
    this.autocomplete = {
      input: ''
    };
  }

  loadMap(item: any) {

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item['description'] }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        var latlng = new google.maps.LatLng(53.3496, -6.3263);
        var mapOptions =
        {
          zoom: 8,
          center: latlng
        }
        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.map.setCenter(results[0].geometry.location);//center the map over the result
        //place a marker at the location
        var marker = new google.maps.Marker(
          {
            map: this.map,
            position: results[0].geometry.location
          });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }


    });
  }


  dismiss() {
    this.showImage = true;
    this.running = false;
    this.items = [];
    this.autocomplete = {
      input: ''
    };

  }


  ngOnInit() {

  }


  formatDestinationCity(item: any) {

    if (item.structured_formatting.secondary_text.indexOf(",") > 0) {
      let lieuSplitted = item.structured_formatting.secondary_text.split(",", 1);
      this.destinationCity = lieuSplitted[0]
    }
    else {
      this.destinationCity = item.structured_formatting.main_text
    }
  }


  chooseItem(item: any) {

    this.showImage = false;
    this.selectedItem = item;
    this.items = [];
    this.autocomplete.input = item.structured_formatting.main_text + " - " + item.structured_formatting.secondary_text;
    this.formatDestinationCity(item);
    this.running = true;
    this.loadMap(item);

  }

  updateSearch() {
    if (this.autocomplete.input == '') {
      this.items = [];
      this.showImage = true;
      this.running = false;
      return;
    }
    if (!this.running) {
      let self = this;
      this.acService.getPlacePredictions({ types: ['geocode'], input: this.autocomplete.input }, function (predictions, status) {
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
