import React, { Component } from 'react'
import { AppLoading } from 'expo'
import Firebase, { FirebaseProvider } from './config/Firebase'
import { View, StyleSheet, Button} from 'react-native'
import {
  Header,
  Container,
  StyleProvider,
} from 'native-base'
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
import { I18nManager} from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'
import TextButton from './src/components/TextButton'


const Stack = createStackNavigator()

const Tab = createBottomTabNavigator()

const MyTheme = {
  ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#BB86FC',
      background: '#121212',
      text: 'rgba(255, 255, 255, 0.87)',
      card: '#2f2f2f',
    },
}


function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                return <FontAwesome name='home' size={35} color={color} />

              } else if (route.name === 'Notifications') {

                return <MaterialIcons name='notifications' size={35} color={color} />
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
            style: {
              height: 55
            },
            activeTintColor: '#BB86FC',
            inactiveTintColor: 'rgba(255, 255, 255, 0.6)',
            showLabel: false,
          }}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Notifications" component={Notifications} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  )
}

function StackNavigator(props) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} initialParams={{login: props.login}} options={{headerShown: false}} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  )
}

//I18nManager.allowRTL(false)
//I18nManager.forceRTL(false)
export default class App extends Component {
  state = {
    isReady: false,
    isLogged: false
  }

  login = () => {
    this.setState({
      isLogged: true,
    })
  }

  componentDidMount() {
    Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    }).then(() => {
      this.setState({ isReady: true })
    })
  }

  render() {
    const { isLogged } = this.state

    if (!this.state.isReady) {
      return <AppLoading />;
    }

    return (
        <FirebaseProvider value={Firebase}>
          <StyleProvider style={getTheme(material)}>
            <Container>
              <NavigationContainer theme={MyTheme}>
                {isLogged ?
                  <TabNavigator />
                : <StackNavigator login={this.login} />}
              </NavigationContainer>
            </Container>
          </StyleProvider>
        </FirebaseProvider>
    )
  }
}
