import React, { Component } from 'react';

export default class LocationTrack extends Component {

  static defaultProps = {
    trackingType: 'byTimer',
    trackingOptions: {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    interval: 60000,
    distance: 200
  }

  static propTypes = {
    trackingType: React.PropTypes.oneOf(['byTimer', 'byDistance']).isRequired,
    trackingOptions: React.PropTypes.object.isRequired,
    interval: React.PropTypes.number,
    distance: React.PropTypes.number,
    setUpdateState: React.PropTypes.func
  }

  constructor(props) {
    super(props);
    intervalId = null;
    watchId = null;
    // console.log(`LocationTrack Constructor`);
  }

  componentDidMount() {
    if (this.props.trackingType === 'byTimer') { this.byTimerTracking() }
    if (this.props.trackingType === 'byDistance') { this.byDistanceTracking() }
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    navigator.geolocation.clearWatch(this.watchId);
    clearInterval(this.intervalId);
  }

  shouldComponentUpdate(){
    return false;
  }

  byTimerTracking() {
    this.intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setLoc('byTimer', position);
        },
        (error) => alert(JSON.stringify(error)),
        this.props.trackingOptions
      );
    }, this.props.interval);
  }

  byDistanceTracking() {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log(this.props.distance + 'm');
        this.setLoc('byDistance', position)
      },
      (error) => this.setState({ error: error.message }),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: this.props.distance
      }
    );
  }

  setLoc(type, position) {
    console.log(type, new Date());
    let next = position.coords;

    this.props.setUpdateState({
      type: type,
      latitude: next.latitude,
      longitude: next.longitude,
      speed: next.speed,
      error: null,
    });
  }

  render() {
    return null;
  }

}