import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'native-base'
import { withFirebaseHOC } from '../../config/Firebase'
import { FlatList } from 'react-native'
import HackathonCard from '../components/HackathonCard'
import HackathonPage from '../screens/HackathonPage'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

// This is the home page that the user will see
// in this script we must display all available hackathons
// sorted from newest to oldest as well as a button to add new hackathons
class Home extends Component {

  constructor( props ) {
    super( props );

    this.state = {
      // This will hold the list of hackathons to be displayed
      hackathons : [],
    };

  }

  // when the component will first be rendered to the
  // DOM it will call getHackathons
  componentDidMount() {
    this.getHackathons();
  }
  componentWillUnmount() {

  }

  // this function will fill the list of hackathons
  // from the firestore
  getHackathons() {
    var buffer = [];
    // the firebase passed through context
    const { firebase } = this.props;

    // reference to the hackathons in firestore
    var hackathons = firebase.allHackathons();

    // get hackathon collection where thier status is open
    // from firestore and use the callback function
    hackathons.where( "status", "==", "open" ).get().then( querySnapshot => {
      querySnapshot.forEach( ( doc ) => {

        // add hackathons to buffer
        buffer.push( doc.data() );
      } )
    } ).then( () => {
      // sort buffer array so that the
      // closest hackathon to start will be first
      buffer.sort( ( a, b ) => { return a.startDateTime.seconds - b.startDateTime.seconds } );

      // after finishing adding, set hackathons as
      // buffer
      this.setState( { hackathons: buffer, } );
    } );
  }

  render() {
    // will return a list of all hackathons
    // sorted from closest to furthest
    return (
      <View style={ { flex: 1, marginTop: 40, } }>
        <FlatList
          data={ this.state.hackathons }
          renderItem={
            ( {item} ) => (
              <HackathonCard
              hackathon={item}
              goToHackathon={() => this.props.navigation.navigate("Hackathon Page", {hackathonId: item.hackathonId, name: item.name})}
              />)
          }
          keyExtractor={(item) => item.hackathonId}
        /></View>
    )
  }
}
const HomeWithFirebase = withFirebaseHOC( Home ) // to have firebase as prop

function HomeStack(props) {
  props.navigation.setOptions({
    tabBarVisible: true,
  })
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={ HomeWithFirebase } />
      <Stack.Screen name="Hackathon Page" component={ HackathonPage } />
    </Stack.Navigator>
  );
}


// to have firebase as prop
export default HomeStack;
