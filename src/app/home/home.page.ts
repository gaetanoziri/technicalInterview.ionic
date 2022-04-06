import { Component, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var google;
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation
} from '@ionic-native/google-maps';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  items: any;
  map: GoogleMap;
  autocomplete: any;
  acService: any;
  placesService: any;
  geocoder: any;
  selectedItem: any;
  sessionToken: any;
  showImage = true;
  destinationCity: string;
  zipCode: string = "";
  address: string;
  latitude: number;
  longitude: number;
  accuracy: number;

  constructor(
    public toastCtrl: ToastController,
    private platform: Platform,
    public zone: NgZone,
  ) {
    this.initPage()
  }
  initPage() {
    this.platform.ready();
    this.geocoder = Geolocation;
    // Create a new session token.
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    this.acService = new google.maps.places.AutocompleteService();
    this.items = [];
    this.autocomplete = {
      input: ''
    };
  }

  loadMap() {
    this.map = GoogleMaps.create('map', {
      camera: {
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 18,
        tilt: 30
      }
    });
    this.goToMyLocation(this.latitude, this.longitude);
  }

  goToMyLocation(lat: number, long: number) {
    this.map.clear();
    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
     

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 17,
        duration: 5000
      });

      //add a marker
      let marker: Marker = this.map.addMarkerSync({
        position: location.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });

      //show the infoWindow
      marker.showInfoWindow();

      this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
        (data) => {
         
        }
      );
    })
      .catch(err => {
        this.showToast(err.error_message);
      });
  }

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }


  dismiss() {
   
    this.showImage = true;
    this.items = [];
    this.autocomplete = {
      input: ''
    };

  }


  ngOnInit() {

  }


  formatDestinationCity(item: any){

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
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item['description'] }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.zone.run(() => {
          this.latitude = results[0].geometry.location.lat();
          this.longitude = results[0].geometry.location.lng();
         
        })
      }
    });

   
    this.platform.ready();
    this.loadMap();
  }

  updateSearch() {
    this.showImage = false;
   
    if (this.autocomplete.input == '') {
      this.items = [];
      this.showImage = true;
      return;
    }
    let self = this;
    let config: any;
    config = {
      types: ['cities'],
      input: this.autocomplete.input,
      sessionToken: this.sessionToken,
      language: "EN",
    }

   

    this.acService.getPlacePredictions({ input: this.autocomplete.input }, function (predictions, status) {  
      self.items = [];
      if (predictions) {
        predictions.forEach(function (prediction) {
          self.items.push(prediction);
        });
      }
    });
  }
}
