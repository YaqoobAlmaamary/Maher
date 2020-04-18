import React, {Component } from 'react'
import { View, StyleSheet , ScrollView , ActivityIndicator , FlatList} from 'react-native'
import { Text, Button } from 'native-base'
import { MaterialCommunityIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons'
import { TextInputWithMsg, TextArea } from '../components/Inputs';
import { Form , H3 } from 'native-base';
import {getDuration} from '../../utils/helper'
import { withFirebaseHOC } from '../../config/Firebase'



class ReviewPage extends Component {

  state = {
    criteria : [],
    value : "",
    valueError: ""
  }


   async componentDidMount(){

  const { teamId , hackathonId } = this.props.route.params
  const hackathonCollection = await this.props.firebase.getHackathonDoc(hackathonId).get()
  let criteria = []

  hackathonCollection.data().criteria.map( (criteriaObj) => {
    const criteriaData = criteriaObj
    criteriaData['criteriaId'] = criteriaObj.criteriaId
    criteriaData['name'] = criteriaObj.name
    criteriaData['description'] = criteriaObj.description
    criteriaData['weight'] = criteriaObj.weight
    criteria = criteria.concat(criteriaData)
  })

  this.setState({
    criteria: criteria
    })



}

render (){
  const { criteria } = this.state

  return (


    <ScrollView>
      <Form>




      <FlatList
          data={ this.state.criteria }
          renderItem={ ({item}) =>
          // for each element in criteria array
          // render it an input place

          <View>
              <H3>{item.name}</H3>
              <TextInputWithMsg
                  label={"Out of " + item.weight }
                  value={ this.state.value }
                  onChangeText={ (value) => {

                      this.setState( {
                         value : item.value
                       })


                  }}

              />
              </View>
            }

            />


      </Form>
   </ScrollView>



  )
}
}


export default withFirebaseHOC( ReviewPage );
