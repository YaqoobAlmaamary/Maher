import { Platform } from 'react-native'
import NetInfo from "@react-native-community/netinfo"
import moment from 'moment'

export const checkConnectivity = (connected, notConnected) => {
  NetInfo.isConnected.fetch().then(isConnected => {
    if (isConnected) {
      connected()

    } else {
      notConnected()
    }
  })
}

//given time in seconds
export const getDuration = (startInSeconds, endInSeconds) => {
  const start = startInSeconds*1000
  const end = endInSeconds*1000
  if(moment(start).isValid() && moment(end).isValid()){
    if(moment(start).format("YYYY") !== moment(end).format("YYYY")){
      return moment(start).format("ll")+"-"+moment(end).format("ll")
    }
    else if(moment(start).format("MM") !== moment(end).format("MM")){
      return moment(start).format("ll").split(",").join("-"+moment(end).format("ll").slice(0,7))
    }
    else if(moment(start).format("DD") !== moment(end).format("DD")){
      return moment(start).format("ll").split(",").join("-"+moment(end).format("D"))
    }
    else {
      return moment(start).format("ll")
    }
  }
  else {
    return "Invalid Dates"
  }
}
