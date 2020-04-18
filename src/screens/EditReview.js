import React, {Component } from 'react'
import { View, StyleSheet, Image, TouchableOpacity , SectionList , ScrollView } from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import {getDuration} from '../../utils/helper'
import { withFirebaseHOC } from '../../config/Firebase'



class EditReview extends Component {


  render(){
    return(

      <View>
      <Text> Edit Review Page </Text>
      </View>
    )
  }


}


export default withFirebaseHOC( EditReview );
