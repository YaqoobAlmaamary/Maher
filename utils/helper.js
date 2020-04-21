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
      return moment(start).format("ll").split(",").join("-"+moment(end).format("MMM")+" "+moment(end).format("D")+",")
    }
    else if(moment(start).format("DD") !== moment(end).format("DD")){
      return moment(start).format("ll").split(",").join("-"+moment(end).format("D")+",")
    }
    else {
      return moment(start).format("ll")
    }
  }
  else {
    return "Invalid Dates"
  }
}

export const checkHackathonDates = (startDateTime, endDateTime, reviewStartDateTime, reviewEndDateTime) => {
  let isError, text
  if(moment(moment(new Date())).diff(moment(startDateTime.getTime())) >= 0){
    isError = true
    text = "Start time should be in the future"
  }
  else if(moment(startDateTime.getTime()).diff(moment(endDateTime.getTime())) >= 0){
    isError = true
    text = "End time should be after the start time"
  }
  else if(moment(endDateTime.getTime()).diff(moment(reviewStartDateTime.getTime())) >= 0){
    isError = true
    text = "Review start time should be after the end time"
  }
  else if(moment(reviewStartDateTime.getTime()).diff(moment(reviewEndDateTime.getTime())) >= 0){
    isError = true
    text = "Review end time should be after the review start time"
  }
  else {
    isError = false
    text = ""
  }
  return {isError: isError, text: text}

}

export const mergeDateTime = (dateTimestamp, timeTimeStamp) => {
  const date = new Date(dateTimestamp)
  const time = new Date(timeTimeStamp)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                    time.getHours(), time.getMinutes())
}

export const checkHackathon = (hackathon) => {
  const validateDates = checkHackathonDates(hackathon.startDateTime, hackathon.endDateTime, hackathon.reviewStartDateTime, hackathon.reviewEndDateTime)
  let isError = false
  let text = ""
  if(hackathon.name.trim() === ""){
    isError = true
    text = "Hackathon name can't be blank"
  }
  else if(hackathon.tagline.trim() === ""){
    isError = true
    text = "Tagline can't be blank"
  }
  else if(hackathon.city.trim() === ""){
    isError = true
    text = "City can't be blank"
  }
  else if(isNaN(hackathon.maxTeams) || hackathon.maxTeams === 0){
    isError = true
    text = hackathon.maxTeams === 0 ? "Max teams can't be zero or blank" : "Max teams should only contains numbers"
  }
  else if(isNaN(hackathon.maxInTeam) || hackathon.maxInTeam === 0 || hackathon.maxInTeam < hackathon.minInTeam){
    isError = true
    text = hackathon.maxInTeam === 0 ?
      "Max number of members in a team can't be zero or blank"
    : hackathon.maxInTeam < hackathon.minInTeam ?
          "Max number of members is smaller than the minimum"
        : "Max number of members field should only contains numbers"
  }
  else if(isNaN(hackathon.minInTeam) || hackathon.minInTeam === 0){
    isError = true
    text = hackathon.minInTeam === 0 ? "Min number of members in a team can't be zero or blank" : "Min number of members field should only contains numbers"
  }
  else if(validateDates.isError){
    isError = true
    text = validateDates.text
  }
  else if(hackathon.criteria.length === 0){
    isError = true
    text = "Please add at least one criterion"
  }
  else if(hackathon.criteria.length !== 0){
    let totalWeights = 0
    hackathon.criteria.map((c, i) => {
      if(c.name.trim() === ""){
        isError = true
        text = `Criterion number ${i+1} missing the name`
        totalWeights += parseFloat(c.weight)
      }
      else if(c.weight.trim() === "" || isNaN(c.weight)){
        isError = true
        text = isNaN(c.weight) ? `Criterion number ${i+1} weight have invalid value, it should be a number ` : `Criterion number ${i+1} missing the weight`
      }
      else {
        totalWeights += parseFloat(c.weight)
      }
    })

    if(totalWeights != 100 && !isNaN(totalWeights)){
      isError = true
      text = `The total criteria weights expect to be 100 but got ${totalWeights} `
    }
  }
  else if(hackathon.currency !== "non-cash" || hackathon.currency === ""){
    if(hackathon.currency === ""){
      isError = true
      text = `Please select currency`
    }
    else if(isNaN(hackathon.totalPrizes) || hackathon.totalPrizes.trim() === ""){
      isError = true
      text = `Currency selected is ${hackathon.currency} and Estimated Total Prizes is blank or contains chars ( it should only be a number)`
    }
  }
  else if(hackathon.prizes.length !== 0){
    hackathon.prizes.map( p => {
      if(p.type === 'cash' && isNaN(p.value)){
        isError = true
        text = `Value of prize number ${p.position} has the type of (cash) the value should only be a number`
      }
      else if(p.value == 0 && p.type === 'cash'){
        isError = true
        text = `Value of prize number ${p.position} has the type of (cash) the value can't be blank or zero`
      }
      else if(p.value.trim() === ""){
        isError = true
        text = `Value of prize number ${p.position} can't be blank`
      }
    })
  }

  return {isError, text}
}

export const uriToBlob = (uri) => {

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest();

    xhr.onload = function() {
      // return the blob
      resolve(xhr.response);
    };

    xhr.onerror = function() {
      // something went wrong
      reject(new Error('uriToBlob failed'));
    };

    // this helps us get a blob
    xhr.responseType = 'blob';

    xhr.open('GET', uri, true);
    xhr.send(null);

  });

}

export const generateId = () => {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
}
