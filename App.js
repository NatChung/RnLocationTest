import React, {useEffect, useState} from 'react';
import {View, Button, PermissionsAndroid, Platform} from 'react-native';

import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const checkLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.setRNConfiguration({authorizationLevel: 'whenInUse'});
    }

    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    return false;
  };

  const requestLocationPermission = async () => {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Here is granted');
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      console.log('Location permission denied by user.');
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      console.log('Location permission revoked by user.');
    }

    return false;
  };

  const checkPermission = async () => {
    // eslint-disable-next-line no-shadow
    const checkPermission = await checkLocationPermission();
    setHasLocationPermission(
      checkPermission ? checkPermission : await requestLocationPermission(),
    );
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (!hasLocationPermission) {
      return;
    }

    const current = Geolocation.watchPosition(
      (info) => console.log('info', info),
      (error) => console.log('error', error),
      {
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

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="ClickMe" onPress={() => console.log('Debug')} />
    </View>
  );
};

export default App;
