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
  isInList = (data) => {
    const { hackathons } = this.state
    return hackathons.find(hackathon => hackathon.hackathonId === data.hackathonId)
  }
  search = (query) => {
    this.setState({
      query,
      result: this.state.hackathons.filter((hackathon) => hackathon.name.toLowerCase().search(query.toLowerCase()) !== -1)
    })
  }
  componentDidMount() {
    const { firebase } = this.props
    let index
    firebase.allHackathons()
      .onSnapshot((querysnapshot) => {
        querysnapshot.forEach((doc) => {
          if(this.isInList(doc.data())){
            this.setState({
              hackathons: this.state.hackathons.filter((hackathon) => hackathon.hackathonId !== doc.data().hackathonId).concat(doc.data())
            })
          }
          else {
            this.setState({
              hackathons: this.state.hackathons.concat(doc.data())
            })
          }
        })
      })
  }
  componentWillUnmount() {

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
