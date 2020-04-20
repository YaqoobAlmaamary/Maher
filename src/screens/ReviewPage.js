import React, {Component } from 'react'
import { View, StyleSheet , ScrollView , ActivityIndicator , FlatList} from 'react-native'
import { Text, Button } from 'native-base'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
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
    toSubmit: null,
    isSubmiting: false,
    isReady: false
  }

  handleReviewChange = (c, input) => {

    let toSubmit = this.state.toSubmit
    const number = input === "" ? '' : parseInt(input)
    const prevNumber = toSubmit.review[c.criteriaId].value

    toSubmit.review[c.criteriaId] = {
      criteriaId: c.criteriaId,
      value: (isNaN(number) || number > 100) ? prevNumber : number,
      weight: c.weight
    }

    this.setState({
      toSubmit: toSubmit
    })

  }

  isThereEmpty = () => {
    const { toSubmit } = this.state
    let isEmpty = false

    if(toSubmit == null)
      isEmpty = true
    else {

      Object.values(toSubmit.review).map(c => {
        if(c.value === null || c.value === '')
          isEmpty = true
      })
    }
    return isEmpty

  }

  submitReview = async () => {
    this.setState({isSubmiting: true})
    const { uid } = this.props.firebase.getCurrentUser()
    const { toSubmit } = this.state
    const { teamId , hackathonId } = this.props.route.params
    const teamRef = this.props.firebase.getTeamDoc(hackathonId, teamId)
    const teamDoc = await teamRef.get()
    const prevReviews = teamDoc.data().reviews

    let updatedData = {}

    if(prevReviews == null)
      updatedData[uid] = toSubmit
    else {
      prevReviews[uid] = toSubmit
      updatedData = prevReviews
    }

    await teamRef.update({reviews: updatedData})
    this.props.navigation.goBack()
  }

 async componentDidMount(){

  const { teamId , hackathonId, teamName } = this.props.route.params
  const hackathonCollection = await this.props.firebase.getHackathonDoc(hackathonId).get()
  const criteria = hackathonCollection.data().criteria

  let toSubmit = {
    judgeId: this.props.firebase.getCurrentUser().uid,
    review: {}
  }

  criteria.map(c => {
    toSubmit.review[c.criteriaId] = {
      criteriaId: c.criteriaId,
      value: null,
      weight: c.weight
    }
  })

  this.setState({
    criteria: criteria,
    toSubmit: toSubmit,
    isReady: true
  })

  this.props.navigation.setOptions({
    title: "Review "+teamName,
    headerTitleAlign: 'center'
  })


}

  render (){
    const { criteria, toSubmit, isSubmiting, isReady } = this.state
    if(!isReady){
      return (
        <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
      )
    }
    if(criteria.length === 0)
      return null
    return (
      <KeyboardAwareScrollView>
        {criteria.map( (item) => (
          <ReviewInput
            key={item.criteriaId}
            criteria={item}
            handleReviewChange={this.handleReviewChange}
            value={toSubmit == null ? "" : toSubmit.review[item.criteriaId].value} />
        ))
        }
        {isSubmiting ?
          <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
        : <Button style={styles.btn} onPress={this.submitReview} disabled={this.isThereEmpty()}>
            <Text style={styles.btnText}>Submit</Text>
          </Button>
        }
      </KeyboardAwareScrollView>
    )
  }
}

function ReviewInput({criteria, handleReviewChange, value}){
  return (
      <Form>
        <Text style={styles.label}>{criteria.name}</Text>
        <TextInputWithMsg
          keyboardType={"numeric"}
          label={"Out of 100"}
          value={ value === null ? "" : value.toString() }
          onChangeText={(number) => handleReviewChange(criteria, number)}
          maxLength={3}
        />
      </Form>
  )
}

const styles = StyleSheet.create({

  label: {
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
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
