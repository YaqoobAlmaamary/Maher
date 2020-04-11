import React, { Component } from 'react'
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import { Text, Icon } from 'native-base'
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import { withFirebaseHOC } from '../../config/Firebase'
import { createStackNavigator } from '@react-navigation/stack'
import moment from 'moment'

const Stack = createStackNavigator()

function NotificationNavigator(props) {
  return (
    <Stack.Navigator initialRouteName="Notifications">
      <Stack.Screen name="Notifications" component={NotificationsWithFirebase} options={{headerTitleAlign: 'center'}} />
    </Stack.Navigator>
  )
}

class Notifications extends Component {
  state = {
    notifications: null
  }
  accept = async (notification) => {
    const { uid } = this.props.firebase.getCurrentUser()
    this.discard(notification)
    await this.props.firebase.addUserToTeam(uid, notification.hackathonId, notification.teamId)
  }
  discard = (notification) => {
    this.setState({
      notifications: this.state.notifications.filter((n) => n.notificationId != notification.notificationId)
    })
    this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid+"/"+notification.notificationId)
      .remove()
        .catch(() => {
          this.setState({
            notifications: this.state.notifications.unShift(notification)
          })
        })
  }
  componentDidMount() {
      this.notificationsRef = this.props.firebase.database().ref('notifications/'+this.props.firebase.getCurrentUser().uid)

      let notifications
      this.notificationsRef
        .on('value', snapshot => {
          if(snapshot.exists())
            notifications= Object.values(snapshot.val())

          else
            notifications = null

          this.setState({
            notifications: notifications
          })
          this.props.navigation.dangerouslyGetParent().setParams({
            notifications: notifications == null ? [] : notifications
          })
        })
  }
  componentWillUnmount() {
    if(this.notificationsRef)
      this.notificationsRef.off()
  }
  render() {
    return (
      <FlatList
        style={{flex: 1}}
        data={this.state.notifications}
        renderItem={({item}) => <NotificationCard accept={this.accept} discard={this.discard} notification={item} /> }
        keyExtractor={(item) => item.notificationId}
        refreshing={true}
      />
    )
  }
}

const NotificationsWithFirebase = withFirebaseHOC(Notifications)

class NotificationCard extends Component {
  state = {
    currTime: Date.now()
  }
  componentDidMount(){
    this.timeInterval = setInterval( () => {
      this.setState({
        currTime : Date.now()
      })
    },60000)
  }
  componentWillUnmount() {
    if(this.timeInterval)
      clearInterval(this.timeInterval)
  }
  render() {
    const { notification, discard, accept } = this.props
    const message = `${notification.fromFullName} invites you to join ${notification.teamName} in ${notification.hackathonName}`
    return (
      <TouchableOpacity style={styles.notificationConatiner}>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <Text style={styles.title}>Team Invitation Request!</Text>
          <Text style={styles.time}>{moment(notification.time).from(this.state.currTime)}</Text>
        </View>
        <View style={styles.row}>
          <Image style={styles.notificationPhoto}
            source={notification.fromPhotoUri == '' ? require('../assets/no-image.png') : {uri: notification.fromPhotoUri}} />
          <View style={{flex: 1}}>
            <Text>{message}</Text>
          </View>
        </View>
        <View style={[styles.row, {justifyContent: 'flex-end'}]}>
          <TouchableOpacity onPress={() => discard(notification)}
            style={[styles.outlineBtn, {borderColor: '#CF6679'} ]}>
            <Text style={{color: '#CF6679'}}>
              <MaterialCommunityIcons size={18} name="close" />
              Discard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => accept(notification)}
            style={[styles.outlineBtn, {borderColor: '#01A299'} ]}>
            <Text style={{color: '#01A299'}}>
              <MaterialCommunityIcons size={18} name="check" />
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    margin: 5,
  },
  title: {
    fontFamily: 'Roboto_medium',
    color: 'rgba(255,255,255,0.6)',
  },
  notificationConatiner: {
    margin: 5,
    marginTop: 10,
    padding: 10,
    paddingRight: 8,
    paddingLeft: 8,
    backgroundColor: '#1d1d1d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 10
  },
  notificationPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  time: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    margin: 5,
    padding: 5,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
})

export default NotificationNavigator
