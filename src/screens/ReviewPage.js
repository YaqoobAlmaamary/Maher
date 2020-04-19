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
    valueError: "",
    submiting : false,
    criteriaObj : []

    }




  reviewTeam = async () => {

  

    this.setState({submiting: true})

    const { teamId , hackathonId } = this.props.route.params
    const hackathonCollection = await this.props.firebase.getHackathonDoc(hackathonId).get()
    const { uid } = this.props.firebase.getCurrentUser()

    let criteria = []

    this.state.criteria.map((criteriaObj) => {

      const criteriaData = {

        criteriaId: criteriaObj.criteriaId,
        value: criteriaObj.value

    }

      criteria = criteria.concat(criteriaData)

      })
      this.setState({
        criteriaObj: criteria
        })

  const updatedData = {

        reviews : {
           uid : {
            judgeId : uid,
            review :  this.state.criteriaObj
          }
          }
}

      await this.props.firebase.getTeamDoc(hackathonId, teamId).update(updatedData)
      this.props.navigation.goBack()
  }

  async componentDidMount(){

    const { hackathonId } = this.props.route.params
    const hackathonCollection = await this.props.firebase.getHackathonDoc(hackathonId).get()
    let criteria = []

    hackathonCollection.data().criteria.map( (criteriaObj) => {

      criteria = criteria.concat(criteriaObj)

    })

    this.setState({
      criteria: criteria
      })

}

render (){
  const { criteria , submiting, valueError} = this.state

  return (

    <ScrollView>
      <Form>

      <FlatList
          data={ this.state.criteria }
          renderItem={ ({item}) =>

          <View>
              <H3 style={styles.label}>{item.name}</H3>
              <TextInputWithMsg
                  key= {item.criteriaId}
                  label={"Out of " + item.weight }
                  error={valueError}
                  value={ this.state.value }
                  onChangeText={ (value) => {
                    item.value = value
                      this.setState( {
                        value : item,
                        valueError: ""
                       })
                  }
                }
              />

              </View>
            }
            />

            {submiting ?
              <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
            : <Button style={styles.btn} onPress={this.reviewTeam}>
                <Text style={styles.btnText}>Submit</Text>
              </Button>
            }


      </Form>
   </ScrollView>



  )
}
}

const styles = StyleSheet.create({

  label: {
    marginTop: 15,
    marginLeft: 15,
    marginBottom: 5
  },
  btn: {
    alignSelf: 'center',
    justifyContent:'center',
    borderRadius: 5,
    margin: 15,
    paddingRight: 15,
    paddingLeft: 15
  },
  btnText: {
    color: '#1e1e1e',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.25,
    textTransform: 'uppercase'
  },
})


export default withFirebaseHOC( ReviewPage );
