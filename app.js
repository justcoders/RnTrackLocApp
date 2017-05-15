import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text
} from 'react-native';

import LocationTrack from './src/components/LocationTrack.js';
import DeviceInfo from 'react-native-device-info';

import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

export default class TrackLoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
      latitude: 0,
      longitude: 0,
      distance: 0,
      speed: 0,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
      trackingActive: false,
      error: null
    };

    this.setUpdateState = this.setUpdateState.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    this.toggleTracking = this.toggleTracking.bind(this);
  }

  componentDidMount(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // this.map.initialRegion = {
        //   latitude: position.coords.latitude,
        //   longitude: position.coords.longitude,
        //   latitudeDelta: this.state.latitudeDelta,
        //   longitudeDelta: this.state.longitudeDelta,
        // };
        this.setState({
          type: 'byStart',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
        });
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  setUpdateState(next){
    console.log(`setUpdateState`, next);
    this.sendLocation(next);
    this.setState(next);
  }

  async sendLocation(data) {
    try {
      return await fetch('https://04u727i4b6.execute-api.us-east-1.amazonaws.com/stageTrackLoc/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTime: `${Date.now()}`,
          deviceId: DeviceInfo.getDeviceId(),
          ...data
        })
      })
    } catch (error) {
      console.error(error);
    }
  }

  onRegionChange(region){
    console.log(region);
    this.setState({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta
    });
  }

  toggleTracking(){
    this.setState({
      trackingActive: !this.state.trackingActive
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <LocationTrack active={this.state.trackingActive}
          trackingType={'byTimer'}
          interval={60000}
          setUpdateState={this.setUpdateState}/>
        <LocationTrack active={this.state.trackingActive}
          trackingType={'byDistance'}
          distance={1000}
          setUpdateState={this.setUpdateState}/>
        <MapView
            ref={(ref) => (this.map = ref)}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            onRegionChange={this.onRegionChange}
            region={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: this.state.latitudeDelta,
              longitudeDelta: this.state.longitudeDelta,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
        >
          <MapView.Marker coordinate={{latitude:this.state.latitude, longitude: this.state.longitude}} />
        </MapView>
        {!this.state.trackingActive
          ? <View style={[styles.bubble, styles.latlng]}>
              <Text onPress={this.toggleTracking} style={styles.labelTxt}>Start Tracking</Text>
            </View>
          : <View style={styles.toolbarContainer}>
              <View style={[styles.bubble, styles.latlng]}>
                <Text style={styles.labelTxt}>
                  {this.state.latitude.toPrecision(7)},
                  {this.state.longitude.toPrecision(7)}
                </Text>
              </View>
              <View style={[styles.bubble, styles.latlng]}>
                <Text onPress={this.toggleTracking} style={styles.labelTxt}>Stop Tracking</Text>
              </View>
            </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  toolbarContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
    justifyContent: 'space-around'
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 20,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(30,144,255,0.3)',
  },
  latlng: {
    width: 200,
    alignItems: 'stretch'
  },
  button: {
    width: 150,
  },
  labelTxt: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'dodgerblue'
  }
});