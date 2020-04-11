// Import Statements
import React, { Component } from 'react'
import { AppLoading } from 'expo'
import Firebase, { FirebaseProvider } from './config/Firebase'
import { View, StyleSheet, Button , StatusBar, Text} from 'react-native'
import { Header, Container, StyleProvider, } from 'native-base'
import * as Font from 'expo-font'
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons'
import getTheme from './native-base-theme/components'
import material from './native-base-theme/variables/material'
import Login from './src/screens/Login.js'
import Register from './src/screens/Register.js'
import Home from './src/screens/Home.js'
import Profile from './src/screens/Profile.js'
import Search from './src/screens/Search.js'
import Notifications from './src/screens/Notifications.js'
import ResetPassword from './src/screens/ResetPassword.js'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'
import TextButton from './src/components/TextButton'
import solve from './solve'
import RNRestart from "react-native-restart"
import { I18nManager} from 'react-native'
import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

I18nManager.allowRTL(false)
I18nManager.forceRTL(false)
if (I18nManager.isRTL)
  RNRestart.Restart();

const Stack = createStackNavigator()

const Tab = createBottomTabNavigator()

const MyTheme = {
  ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#BB86FC',
      background: '#121212',
      text: 'rgba( 255, 255, 255, 0.87 )',
      card: '#2f2f2f',
    },
}


class TabNavigator extends Component {
  state = {
    notifications: []
  }
  componentDidMount() {
    if(Firebase.getCurrentUser() != null) {
      Firebase.database().ref('notifications/'+Firebase.getCurrentUser().uid)
        .on('value', snapshot => {
          if(snapshot.exists())
            this.setState({
              notifications: Object.keys(snapshot.val())
            })
          else
            this.setState({
              notifications: []
            })
        })
    }
  }
  componentWillUnmount() {
    if(Firebase.getCurrentUser() != null)
      Firebase.database().ref('notifications/'+Firebase.getCurrentUser().uid).off()
  }
  render() {
    const { notifications } = this.state
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  return <FontAwesome name='home' size={35} color={color} />

                } else if (route.name === 'Notifications') {

                  return <BillWithBadge size={35} color={color} badgeCount={route.params.notifications.length} />
                } else if (route.name === 'Search') {

                  return <MaterialIcons name='search' size={35} color={color} />
                } else if (route.name === 'Profile') {

                  return <MaterialIcons name='person' size={35} color={color} />
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: '#BB86FC',
              inactiveTintColor: 'rgba(255, 255, 255, 0.6)',
              showLabel: false,
            }}>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Notifications" initialParams={{notifications}} component={Notifications} />
          <Tab.Screen name="Search" component={Search} />
          <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    )
  }
}

function StackNavigator(props) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
      <Stack.Screen name="Register" initialParams={{registerRequest: props.registerRequest}} component={Register} />
      <Stack.Screen name="Reset Password" component={ResetPassword} />
    </Stack.Navigator>
  )
}

function BillWithBadge({ badgeCount, color, size }) {
  return (
    <View>
      <MaterialIcons name='notifications' size={size} color={color} />
      {badgeCount > 0 && (
        <View
          style={{
            // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
            position: 'absolute',
            right: 2,
            top: 3,
            backgroundColor: '#01A299',
            borderRadius: 6,
            width: 12,
            height: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// "Main function"
export default class App extends Component {
  state = {
    isReady: false,
    isAuth: false,
    isRegisterRequest: false,
  }

  registerRequest = () => {
    this.setState({
      isRegisterRequest: true
    })
  }

  componentDidMount() {
    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    }).then(() => {
      this.unsubscribe = Firebase.checkUserAuth((user) => {
        if(user){
          if(!this.state.isRegisterRequest){
            this.setState({
              isAuth: true,
              isReady: true
            })
          }
          else {
            this.setState({
              isAuth: false,
              isRegisterRequest: false,
              isReady: true,
            })
          }
        }
        else {
          this.setState({
             isAuth: false,
             isRegisterRequest: false,
             isReady: true
           })
        }
      })
    })
  }
  componentWillUnmount(){
    if(this.unsubscribe)
      this.unsubscribe()
  }

  render() {
    const { isAuth } = this.state

    if (!this.state.isReady) {
      return <AppLoading />;
    }

    return (
        <FirebaseProvider value={Firebase}>
          <StyleProvider style={getTheme(material)}>
            <Container>
              <StatusBar barStyle='light-content' />
              <NavigationContainer theme={MyTheme}>
                {isAuth ?
                  <TabNavigator />
                : <StackNavigator registerRequest={this.registerRequest} />}
              </NavigationContainer>
            </Container>
          </StyleProvider>
        </FirebaseProvider>
    )
  }
}
