import { Platform } from 'react-native'
import NetInfo from "@react-native-community/netinfo"

export const checkConnectivity = (connected, notConnected) => {
  NetInfo.isConnected.fetch().then(isConnected => {
    if (isConnected) {
      connected()

    } else {
      notConnected()
    }
  })
}
