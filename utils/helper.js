import { Platform } from 'react-native'
import NetInfo from "@react-native-community/netinfo"

export const checkConnectivity = (connected, notConnected) => {
  // For Android devices
  if (Platform.OS === "android") {
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        connected()

      } else {
        notConnected()
      }
    })
  } else {
    // For iOS devices
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleFirstConnectivityChange
    )
  }
}

const handleFirstConnectivityChange = isConnected => {
  NetInfo.isConnected.removeEventListener(
    "connectionChange",
    this.handleFirstConnectivityChange
  );

  if (isConnected === false) {
    notConnected()
  } else {
    connected()
  }
}
