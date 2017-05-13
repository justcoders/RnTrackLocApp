import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

import LocationTrack from './src/components/LocationTrack.js';
import DeviceInfo from 'react-native-device-info';

export default class TrackLoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: null,
      latitude: null,
      longitude: null,
      distance: 0,
      speed: 0,
      error: null
    };

    this.count = 0;

    this.getLocation = this.getLocation.bind(this);
    this.setUpdateState = this.setUpdateState.bind(this)
  }

  setUpdateState(next){
    console.log(`setUpdateState ${this.count})`, next);
    this.count++;

    let prev = this.state;
    let distance = (prev.latitude && prev.longitude)
      ? this.calcDistance(prev.latitude, prev.longitude, next.latitude, next.longitude)
      :0;

    this.sendLocation(next);

    this.setState({
      ...next,
      distance
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('byButton', position.coords);
        this.setState({
          type: 'byButton',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
        });
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  calcDistance(lat1, lon1, lat2, lon2) {
    let R = 6371 * 1000; // radius of Earth, meters
    let degreesToRad = Math.PI / 180;

    let deltaLat = (lat2  - lat1) * degreesToRad;
    let deltaLon = (lon2 - lon1) * degreesToRad;

    let a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
      Math.cos(lat1 * degreesToRad) * Math.cos(lat2 * degreesToRad) *
      Math.sin(deltaLon/2) * Math.sin(deltaLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
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

  render() {
    return (
      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LocationTrack interval={300000} setUpdateState={this.setUpdateState}/>
        <LocationTrack trackingType={'byDistance'} distance={1000} setUpdateState={this.setUpdateState}/>
        <Text>Received - From: {this.state.type}</Text>
        <Text>Latitude: {this.state.latitude}</Text>
        <Text>Longitude: {this.state.longitude}</Text>
        <Text>Speed: {this.state.speed}</Text>
        <Text>Distance: {this.state.distance}</Text>
        {this.state.error ? <Text>Error: {this.state.error}</Text> : null}
        <Text>==========================</Text>
        <Text onPress={this.getLocation}>GetLocation</Text>
      </View>
    );
  }
}