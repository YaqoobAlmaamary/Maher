import React, { Component } from 'react'
import { AppLoading } from 'expo'
import { View, StyleSheet, Button} from 'react-native'
import {
  Header,
  Container,
  StyleProvider,
} from 'native-base'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import getTheme from './native-base-theme/components'
import material from './native-base-theme/variables/material'
import Login from './src/screens/Login.js'
import Register from './src/screens/Register.js'
import { I18nManager} from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import TextButton from './src/components/TextButton'


const Stack = createStackNavigator();
const MyTheme = {
  ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#BB86FC',
      background: '#121212',
      text: 'rgba(255, 255, 255, 0.87)',
      card: '#2f2f2f',
    },
};

//I18nManager.allowRTL(false)
//I18nManager.forceRTL(false)
export default class App extends Component {
  state = {
    isReady: false,
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
    if (!this.state.isReady) {
      return <AppLoading />;
    }

    return (
        <StyleProvider style={getTheme(material)}>
          <Container>
            <NavigationContainer theme={MyTheme}>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
                <Stack.Screen name="Register" component={Register}
                options={{
                title: 'Create new account',
                headerTitleAlign: 'center',
                headerRight: () => (
                  <TextButton onPress={() => alert('This is a button!')} style={{fontSize: 16, margin: 15, letterSpacing: 0, textTransform: 'capitalize',}}>
                    Cancel
                  </TextButton>
                ),
              }}/>
              </Stack.Navigator>
            </NavigationContainer>
          </Container>
        </StyleProvider>
    )
  }
}
