/* eslint-disable prettier/prettier */
/* eslint-disable curly */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {View, Text, PermissionsAndroid, ToastAndroid, Platform, StyleSheet} from 'react-native';

import _ from 'lodash';
import * as geolib from 'geolib';

import Geolocation from 'react-native-geolocation-service';
import usePrevious from './usePrevious';

const App = () => {

  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currPos, setCurrPos] = useState(null);
  const prevPos = usePrevious(currPos);
  const [info, setInfo] = useState({
    horDistance:null,
    distance:null,
    heightDelta: null,
  })

  const checkLocationPermission = async () => {
    if (Platform.OS === 'ios') Geolocation.setRNConfiguration({authorizationLevel: 'whenInUse'});
    if ( Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version < 23)) return true;
    const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (hasPermission) return true;
    return false;
  };

  const requestLocationPermission = async () => {
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,);
    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show('Location permission revoked by user.', ToastAndroid.LONG);
    }

    return false;
  };

  const checkPermission = async () => {
    // eslint-disable-next-line no-shadow
    const checkPermission = await checkLocationPermission();
    setHasLocationPermission(checkPermission ? checkPermission : await requestLocationPermission(),);
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (!hasLocationPermission) return;
    const current = Geolocation.watchPosition( setCurrPos, (error) => console.log('error', error),{
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 3000,
        showLocationDialog: true,
        forceRequestLocation: true,
      },
    );
    return () => Geolocation.clearWatch(current);
  }, [hasLocationPermission]);

  useEffect(() => {
    if (!currPos || !prevPos) return;

    const { latitude: currLatitude, longitude: currLongitude, altitude: currAltitude } = _.get(currPos, 'coords', {});
    const { latitude: prevLatitude, longitude: prevLongitude, altitude: prevAltitude } = _.get(prevPos, 'coords', {});

    console.log(`${prevLatitude} -> ${currLatitude}`);
    console.log(`${prevLongitude} -> ${currLongitude}`);
    console.log(`${prevAltitude} -> ${currAltitude}`);

    const heightDelta = currAltitude - prevAltitude;
    const distance = geolib.getDistance(prevPos.coords, currPos.coords)
    // const distance = (Math.sqrt(Math.pow(heightDelta, 2) + Math.pow(horDistance, 2)));
    setInfo({heightDelta, distance});
  }, [currPos]);

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={styles.text}>{`${currPos?.coords?.latitude}, ${currPos?.coords?.longitude}`}</Text>
      <Text style={styles.text}>{`海拔: ${currPos?.coords?.altitude.toFixed(2)}`}</Text>
      <Text style={styles.text}>{`distance: ${info.distance.toFixed(2)}`}</Text>
      <Text style={styles.text}>{`heightDelta: ${info.heightDelta.toFixed(2)}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
  }
});

export default App;
