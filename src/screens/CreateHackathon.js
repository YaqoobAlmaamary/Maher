import React from 'react'
import { withFirebaseHOC } from "../../config/Firebase"
import { View, Text, Image } from 'react-native'
import { ScrollView, FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Form, H3 } from 'native-base';
import { TextInputWithMsg, TextArea } from '../components/Inputs';
import { StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from 'react-native-modal-datetime-picker';

class CreateHackathon extends React.Component{
    constructor( props ){
        super( props )
        // the state will then be sent to
        // the firestore 
        this.state = {
            name: "",
            description: "",
            criteria: [],
            maxInTeam: 0,
            maxTeams: 0,
            minInTeam: 0,
            startDate: new Date(),
            startTime: new Date(),
            endDate: new Date(),
            endTime: new Date(),
            banner: "",
            prizes: [],
            currency: "",
        }
        // not in state to avoid unnecessary properties
        this.prizePositionCounter = 0;
        this.showDateTimePicker_startDate = false
        this.showDateTimePicker_startTime = false
        this.showDateTimePicker_endDate = false
        this.showDateTimePicker_endTime = false
    }

    _showDateTimePicker( type ){
        if( type === "startDate" ){
            this.showDateTimePicker_startDate = true
            console.log( this.showDateTimePicker_startDate )
        }
        else if( type === "startTime" ){
            this.showDateTimePicker_startTime = true
        }
        else if( type === "endDate" ){
            this.showDateTimePicker_endDate = true
        }
        else if( type === "endTime" ){
            this.showDateTimePicker_endTime = true
        }
        // this is done because the DateTimePicker component will not refresh
        // due to because its state has not changed and react native did not update it
        // as a result we force update the whole page
        this.forceUpdate()
        
    }

    _hideDateTimePicker( type ){
        if( type === "startDate" ){
            this.showDateTimePicker_startDate = false
        }
        else if( type === "startTime" ){
            this.showDateTimePicker_startTime = false
        }
        else if( type === "endDate" ){
            this.showDateTimePicker_endDate = false
        }
        else if( type === "endTime" ){
            this.showDateTimePicker_endTime = false
        }
        this.forceUpdate()
    }

    setStartDate( date ){
       this.setState( { startDate: date } )
       this._hideDateTimePicker( "startDate" )
    }

    setStartTime( time ){
        this.setState( { startTime: time } )
        this._hideDateTimePicker( "startTime" )
    }

    setEndDate( date ){
        this.setState( { endDate: date } )
        this._hideDateTimePicker( "endDate" )
    }

    setEndTime( time ){
        this.setState( {endTime: time } )
        this._hideDateTimePicker( "endTime" )
    }

    // get date in the format dd/mm/yyyy
    get_Day_Month_Year( from ){
        var date = this.state[from]
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    }

    // get time in the format hours:min
    get_hours_min( from ){
        var time = this.state[from]
        return time.getHours() + ":" + time.getMinutes();
    }

    // this method will change the state only if a number was given
    // in addition the property must be specified as type
    // for example changing the property maxTeams to 10, the data will be added
    // and the type will be maxTeams:
    // add_number_to_state( 10, "maxTeams" )
    add_number_to_state( data, type ){
        // check if data is NOT a number
        if( isNaN( data ) ){
            this.setState( ( previousState ) => previousState )
            console.log( this.state )
        } else{
            // get the state 
            var state = this.state
            // change the data of the chosen type
            state[type] = data
            // reset state
            this.setState( () => state )
        }
    }

    //This method will take an item and update the prizes
    //array in the state whether its new item or not
    add_item_to_prizes( item ){
        var buffer = this.state.prizes.filter( ( element ) => element !== item )
        buffer.push( item )
        this.setState( { prizes: buffer } )
    }

    // this method adds a prize to the
    addPrize(){
        var buffer = this.state.prizes
        // create new prize and give it a position
        // this.prizePositionCounter will start from 0
        buffer[this.prizePositionCounter] = { 
            position: this.prizePositionCounter + 1, 
            type: "",
            value: 0,
            desc: "",
        }
        this.prizePositionCounter++;
        this.setState( { prizes: buffer } )
    }

    // this method will remove prize (item) from the 
    // prizes array in the state and shift the array
    removePrize( item ){
        var buffer = this.state.prizes
        // filter the array by changing the element to JSON notation and comparing
        buffer = buffer.filter( (element) => JSON.stringify( element ) !== JSON.stringify( item ) )
        // what was the position of the removed prize
        // was it the prize for first position or second
        var positionForPrize = item.position;
        this.prizePositionCounter--;
        // shift array
        buffer.forEach( (element) => {
            // if the removed position is smaller than the element
            // the decrement element position for example the removed position was 2
            // first will check if 1 > 2 and will not change position 1 then it will
            // check if 3 > 2 (position was already filtered there is no position in the array)
            // then it will decrement 3 to 2
            if( element.position > positionForPrize ){
                element.position--;
            }
        })
        // update state
        this.setState( { prizes: buffer } )
    }

    addCriteria(){
        // new criteria
        var criteria = {
            name: "",
            value: "",
        }
        // list of all criterias
        var criterias = this.state.criteria
        criterias.push( criteria );
        this.setState( () => ({ criteria: criterias }) )
    }

    removeCriteria( criteria ){
        var criterias = this.state.criteria
        criterias = criterias.filter( word => word.name !== criteria.name )
        this.setState( () => ({ criteria: criterias }) )
    }


    async addBanner(){
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();
        if( permissionResult === false ){
            alert( "Permission need to add banner" )
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            quality: 1,
        });

        if (pickerResult.cancelled === true) {
          return;
        }
        // change the size of the picture
        pickerResult.width = 360
        pickerResult.height = 170
        
        this.setState( () => ({ banner: pickerResult }) )
    }

    render() {
        return ( 
            <ScrollView>
                <Form>
                    <H3 style={ styles.label } >Hackathon Name</H3>
                    <TextInputWithMsg 
                        label="Hackathon name"
                        value={ this.state.name }
                        onChangeText={(name) => {
                            this.setState({
                              name,
                              nameError: ''
                            })
                          }}
                    />

                    <H3 style={ styles.label }>Hackathon Description</H3>
                    <TextArea
                        rowSpan={4} 
                        placeholder="Hackathon Description"
                        value={ this.state.description }
                        onChangeText={ (description) => {
                            this.setState({
                                description: description,
                            })
                        }}
                    />

                    {/**List of critera*/}
                    <H3 style={ styles.label }>Criteria</H3>
                    <FlatList 
                        data={ this.state.criteria }
                        renderItem={ ({item}) =>
                        // for each element in criteria array
                        // render it an input place
                        <View>
                            <H3 style={ styles.label }>Criterion Name</H3>     
                            <TextInputWithMsg 
                                label="Name"
                                value={ item.name }
                                onChangeText={ (name) => {
                                    item.name = name
                                    this.setState( { item } )
                                }}
                            />

                            <H3 style={ styles.label }>Value</H3>
                            <TextInputWithMsg
                                label="Value"
                                value={ item.value }
                                onChangeText={ (value) => {
                                    item.value = value
                                    this.setState( { item } )
                                }}
                            />
                            <TouchableOpacity style={ styles.btn } onPress={ () => this.removeCriteria( item )}>
                                <Text style={ styles.remove } >Remove Criterion</Text>
                            </TouchableOpacity>
                        </View>}
                    />
                    {/**Button to add criteria */}
                    <TouchableOpacity style={ styles.btn } onPress={ () => this.addCriteria() }>
                        <Text style={ styles.add }>Add Criterion</Text>
                    </TouchableOpacity>

                    {/**maxInTeam */}
                    <H3 style={ styles.label }>Maximum number of members in a team</H3>
                    <TextInputWithMsg
                        label="Max members in a team"
                        value={ this.state.maxInTeam }
                        onChangeText={ ( maxInTeam ) => this.add_number_to_state( maxInTeam, "maxInTeam" )}
                    />

                    {/**MaxTeams */}
                    <H3 style={ styles.label }>Maximum number of teams</H3>
                    <TextInputWithMsg 
                        label="Max Teams"
                        value={ this.state.maxTeams }
                        onChangeText={ ( maxTeams ) => this.add_number_to_state( maxTeams, "maxTeams" ) }   
                    />
                    {/**minInteam */}
                    <H3 style={ styles.label } >Minimum number of members in a team</H3>
                    <TextInputWithMsg
                        label="Min members in a team"
                        value={ this.state.minInTeam }
                        onChangeText={ ( minInTeam ) => this.add_number_to_state( minInTeam, "minInTeam" ) }
                    />


                    


                    {/**Time related components------------------------------------------ */}
                    <H3 style={ styles.label } >Start Date currently is: { this.get_Day_Month_Year( "startDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "startDate" ) }>
                        <Text style={ styles.add } >Change Start Date</Text>
                    </TouchableOpacity>
                    
                    <View style={ styles.container } >
                        <DateTimePicker
                            mode="date"
                            minimumDate={ new Date() } 
                            isVisible={ this.showDateTimePicker_startDate }
                            onConfirm={ (date) => this.setStartDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "startDate" ) }
                        />
                    </View>

                    

                    <H3 style={ styles.label }>Start Time currently is: { this.get_hours_min( "startTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "startTime" ) } >
                        <Text style={ styles.add } >Change Start Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time" 
                            isVisible={ this.showDateTimePicker_startTime }
                            onConfirm={ (date) => this.setStartTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "startTime" ) }
                        />
                     </View>
                    
                    <H3 style={ styles.label }>End Date currently is: { this.get_Day_Month_Year( "endDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "endDate" ) } >
                        <Text style={ styles.add } >Change End Date</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="date" 
                            minimumDate={ new Date() } 
                            isVisible={ this.showDateTimePicker_endDate }
                            onConfirm={ (date) => this.setEndDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "endDate" ) }
                        />
                    </View>

                    <H3 style={ styles.label }>End Time currently is: { this.get_hours_min( "endTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "endTime" ) } >
                        <Text style={ styles.add } >Change End Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time" 
                            isVisible={ this.showDateTimePicker_endTime }
                            onConfirm={ (date) => this.setEndTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "endTime" ) }
                        />
                    </View>
                

                    {/**button to add banner ======================================================*/}
                    <View style={ { justifyContent: "center", alignItems: "center" } }>
                        <Image source={ this.state.banner } />
                    </View>
                    
                    <TouchableOpacity style={ styles.bannerBtn } onPress={ () => this.addBanner() }>
                        <Text style={ styles.btnText } >Add Banner</Text>
                    </TouchableOpacity>
                    
                    {/**List of Prizes*/}
                    <H3 style={ styles.label }>Currency used in all the prices</H3>
                    <TextInputWithMsg 
                        label="Currency"
                        value={ this.state.currency }
                        onChangeText={ (data) => {
                            this.setState( () => ({ currency: data }) )
                        }}

                    />

                    <H3 style={ styles.label }>Prizes</H3>
                    <FlatList
                    data={ this.state.prizes } 
                    renderItem={ ({item}) =>
                        <View> 
                            { console.log( item ) }
                            <H3 style={ styles.label }>Prize in position { item.position }</H3>
                            <H3 style={ styles.label }>Type of the prize (for example cash or material possession like fridge or TV)</H3>
                            <TextInputWithMsg
                                label="Type"
                                value={ item.type }
                                onChangeText={ (type) => {
                                    item.type = type
                                    this.add_item_to_prizes( item )
                                }}
                            />

                            <H3 style={ styles.label }>Value (how much is the price worth)</H3>
                            <TextInputWithMsg 
                                label="value"
                                value={ item.value }
                                onChangeText={ (value) => {
                                    item.value = value
                                    this.add_item_to_prizes( item )
                                }}
                            />

                            <H3 style={ styles.label } > Description</H3>
                            <TextInputWithMsg
                                label="describe the prize"
                                value={ item.desc }
                                onChangeText={ (desc) => {
                                    item.desc = desc
                                    this.add_item_to_prizes( item )
                            }}
                            />

                            <TouchableOpacity style={ styles.btn } onPress={ () => this.removePrize(item)}>
                                <Text style={ styles.remove } > Remove Prize </Text>
                            </TouchableOpacity>
                        </View>
                    }
                    />
                    {/**Button to add a prize */}
                    <TouchableOpacity  style={ styles.btn } onPress={ () => this.addPrize() }>
                        <Text style={ styles.add } >Add Prize</Text>
                    </TouchableOpacity>
                

                </Form>
            </ScrollView> 
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
    },
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
      color: '#BBB',
      fontWeight: 'bold',
      fontSize: 14,
      letterSpacing: 1.25,
      textTransform: 'uppercase'
    },
    add: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "green",
        color: "green",
        padding: 10,
        paddingRight: 20,
        paddingLeft: 20,
    },
    remove: {
        borderWidth: 1,
        borderRadius: 10, 
        borderColor: "red", 
        color: "red",
        padding: 10, 
    },
    bannerBtn: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#f0b129",
        padding: 10,
        alignSelf: 'center',
        justifyContent:'center',
        margin: 10,
    }

  })

// wrap createHackathon component in <firebase.consumer> and export it
export default withFirebaseHOC( CreateHackathon );