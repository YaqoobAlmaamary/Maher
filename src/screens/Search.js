import React, { Component } from 'react'
import { View, FlatList, TextInput, TouchableOpacity } from 'react-native'
import { Text, Input } from 'native-base'
import HackathonCard from '../components/HackathonCard'
import HackathonPage from '../screens/HackathonPage'
import moment from 'moment'
import Constants from 'expo-constants'
import { createStackNavigator } from '@react-navigation/stack'
import { withFirebaseHOC } from '../../config/Firebase'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const Stack = createStackNavigator()

class Search extends Component {
  state = {
    query: '',
    hackathons: [],
    result: []
  }
  search = (query) => {
    this.setState({
      query,
      result: this.state.hackathons.filter((hackathon) => hackathon.name.toLowerCase().search(query.toLowerCase().trim()) !== -1)
    })
  }
  componentDidMount() {
    const { firebase } = this.props
    let unSortedHackathons

    // listen for changes in hackathons that are open
    this.unsubscribe = firebase.allHackathons().where("status", "==", "open")
      .onSnapshot((querysnapshot) => {
        querysnapshot.docChanges().forEach((change) => {
          if(change.type === "added") {
            // add it directly
            unSortedHackathons = this.state.hackathons.concat(change.doc.data())
          }
          if(change.type === "modified"){
            // if it's modefied then remove it from the state and then add it
            unSortedHackathons =
              this.state.hackathons.filter((hackathon) =>
                hackathon.hackathonId !== change.doc.data().hackathonId
              ).concat(change.doc.data())
          }
          if(change.type === "removed"){
            // if hackathon status is changed or it is removed, then remove it directly
            unSortedHackathons =
              this.state.hackathons.filter((hackathon) =>
                hackathon.hackathonId !== change.doc.data().hackathonId
              )
          }
          // sort based on closest startDateTime
          const sortedHackathons = unSortedHackathons.sort(( a, b ) => ( a.startDateTime.seconds - b.startDateTime.seconds ) )
          // apply changes to the state
          this.setState({
            hackathons: sortedHackathons
          })
        })
      })
  }
  componentWillUnmount() {
    // unsubscribe from listener only if it was defined
    if(this.unsubscribe)
      this.unsubscribe()
  }
  render() {
    const {query, hackathons, result} = this.state
    this.props.navigation.setOptions({
      headerStyle: {
        backgroundColor: '#272727'
      },
      headerLeft:() => (
        <TouchableOpacity style={{marginLeft: 10}}>
          <MaterialCommunityIcons size={32}
            style={{color: 'rgba(255,255,255,0.87)'}}
            name='filter-variant' />
        </TouchableOpacity>
      ),
      headerTitleContainerStyle: {justifyContent: 'center', alignSelf:'center', alignItems:'center'},
      headerTitle: null,
      headerRight: () => <SearchBar query={this.state.query} search={this.search} />,
    })
    return (
      <View style={{ flex: 1, marginTop: 10 }}>
        {<FlatList
          data={query === '' ? hackathons: result}
          renderItem={({item}) => <HackathonCard hackathon={item} goToHackathon={() => this.props.navigation.navigate("Hackathon Page", {hackathonId: item.hackathonId, name: item.name})} /> }
          keyExtractor={(item) => item.hackathonId}
        />}
      </View>
    )
  }
}

function SearchBar({query, search}){
  return (
    <View style={{height: 40}}>
      <Input
      style={{backgroundColor: '#121212', borderRadius: 20, width: 300, marginRight: 10, paddingLeft: 10}}
      placeholder= 'Search...'
      onChangeText={(q) => search(q)}
      value={query} />
    </View>
  )
}

const SearchWithFirebase = withFirebaseHOC(Search) // to have firebase as prop

function SearchStack(props) {
  props.navigation.setOptions({
    tabBarVisible: true,
  })
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchWithFirebase} />
      <Stack.Screen name="Hackathon Page" component={HackathonPage} />
    </Stack.Navigator>
  );
}


export default SearchStack
