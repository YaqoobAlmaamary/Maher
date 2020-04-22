import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, BackHandler, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types'
import { useFocusEffect } from '@react-navigation/native'

export default function MyMap({isMapVisible, onConfirm, onClose, initialRegion, coordinate}) {
  const [regionState, setRegionState] = React.useState(initialRegion)
  const [coordinateState, setCoordinateState] = React.useState(coordinate)

  // handle back button in android only, to prevent from pop the sreen from the stack
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onClose()
        return true;
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    })
  )

  if(isMapVisible === false || isMapVisible == null){
    return null
  }
  return (
    <View style={styles.container}>
      <MapView style={styles.mapStyle}
        initialRegion ={regionState}
        onChangeRegion={() => setRegionState({ region })}
      >
        <Marker draggable
        coordinate={coordinateState}
        onDragEnd={(e) => setCoordinateState({ latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude })}
        />
      </MapView>
      <View style={styles.buttonsConatiner}>
        <TouchableOpacity style={styles.confirmMapButton} onPress={() => onConfirm(coordinateState)}>
          <Text style={styles.confirmMapButtonText}>Confirm this location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeMapButton} onPress={() => onClose()}>
          <Text style={styles.closeMapButtonText}>Close The Map</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>Hold the marker to move it, press confirm to save changes</Text>
    </View>
  );

}

MyMap.propTypes = {
  isMapVisible: PropTypes.bool.isRequired,
  initialRegion: PropTypes.exact({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      latitudeDelta: PropTypes.number,
      longitudeDelta: PropTypes.number,
    }).isRequired,
  coordinate: PropTypes.exact({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }).isRequired,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonsConatiner: {
    position: 'absolute',
    bottom: 100,
  },
  closeMapButton: {
    backgroundColor: "#2f2f2f",
    padding: 10,
    borderRadius: 5,
    margin: 5
  },
  closeMapButtonText: {
    color: "white",
    fontWeight: 'bold',
    textAlign: 'center'
  },
  confirmMapButton: {
    backgroundColor: "#BB86FC",
    padding: 10,
    borderRadius: 5,
    margin: 5
  },
  confirmMapButtonText: {
    color: '#2f2f2f',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  helperText : {
    backgroundColor: 'rgba(255,255,255,0.6)',
    position: 'absolute',
    textAlign: "center",
    top: 40
  }
});
