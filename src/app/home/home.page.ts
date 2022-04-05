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
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
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
          lat: 43.0741704,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 30
      }
    });
    this.goToMyLocation(51.5072, 0.1276);
  }

  goToMyLocation(lat: number, long: number) {
    this.map.clear();
    let lati = this.latitude;
    let longi = this.longitude;

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      console.log(JSON.stringify(location, null, 2));

      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: {
          lat: "51.5072",
          lng: "0.1276"
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
          console.log("Click MAP", data);
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
    console.log("Clear search")
    this.showImage = true;
    this.items = [];
    this.autocomplete = {
      input: ''
    };

  }


  ngOnInit() {

  }


  chooseItem(item: any) {
    console.log('modal > chooseItem > item > ', item['description']);
    this.showImage = false;
    this.selectedItem = item;
    this.items = [];
    this.autocomplete.input = item.structured_formatting.main_text + " - " + item.structured_formatting.secondary_text;
    if (item.structured_formatting.secondary_text.indexOf(",") > 0) {
      let lieuSplitted = item.structured_formatting.secondary_text.split(",", 1);
      this.destinationCity = lieuSplitted[0]
    }
    else {
      this.destinationCity = item.structured_formatting.main_text
    }
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item['description'] }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.zone.run(() => {
          this.latitude = results[0].geometry.location.lat();
          this.longitude = results[0].geometry.location.lng();
          console.log("Ok latitude " + this.latitude)
        })
      }
    });

    console.log("Ok selected item " + JSON.stringify(this.selectedItem))
    this.platform.ready();
    this.loadMap();
  }

  updateSearch() {
    this.showImage = false;
    console.log('modal > updateSearch ' + this.autocomplete.input);
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

    console.log(config)

    this.acService.getPlacePredictions({ input: this.autocomplete.input }, function (predictions, status) {
      console.log('modal > getPlacePredictions > status > ', status);
      self.items = [];
      console.log("predictions " + JSON.stringify(predictions))
      if (predictions) {
        predictions.forEach(function (prediction) {
          self.items.push(prediction);
        });
      }
    });
  }
}
