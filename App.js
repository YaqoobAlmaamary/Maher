import React, { Component } from 'react'
import { AppLoading } from 'expo'
import { View, StatusBar, StyleSheet} from 'react-native'
import {
  Header,
  Container,
  StyleProvider,
} from 'native-base'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import getTheme from './native-base-theme/components'
import material from './native-base-theme/variables/material'
import Login from './src/screens/Login.js'
import Register from './src/screens/Register.js'
import { I18nManager} from 'react-native'

function MaherStatusBar ({backgroundColor, ...props}) {
  return (
    <View style={{ backgroundColor, height: Constants.statusBarHeight }}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  )
}


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
          <MaherStatusBar backgroundColor='#000000' barStyle="light-content" />
          <Header />
          <Register />
        </Container>
      </StyleProvider>
    )
  }
}
