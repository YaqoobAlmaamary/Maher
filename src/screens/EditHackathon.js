import React from 'react'
import { withFirebaseHOC } from "../../config/Firebase"
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Form, H3, Button } from 'native-base';
import { TextInputWithMsg, TextArea } from '../components/Inputs';
import { StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from 'react-native-modal-datetime-picker';
import RadioForm from 'react-native-simple-radio-button'
import { checkHackathon, mergeDateTime, uriToBlob, generateId } from '../../utils/helper'
import { generatePushID } from '../../utils/generate-pushid'
import moment from 'moment'

class EditHackathon extends React.Component{
    constructor( props ){
        super( props )
        this.onChangePrize = this.onChangePrize.bind(this);
        this.removePrize = this.removePrize.bind(this);
        this.removeCriteria = this.removeCriteria.bind(this);
        this.updateHackathon = this.updateHackathon.bind(this)
        // the state will then be sent to
        // the firestore ( some of it )

        const today = new Date()
        const tomorrow = new Date(today)
        const initialStartDate = tomorrow.setDate(tomorrow.getDate() + 1) // tomorrow
        const initialEndDate = tomorrow.setDate(tomorrow.getDate() + 2) // after tomorrow
        this.state = {
            hackathonId: null,
            name: "",
            tagline: "",
            description: "",
            city: "",
            criteria: [],
            maxInTeam: 0,
            maxTeams: 0,
            minInTeam: 0,
            startDate: new Date(initialStartDate),
            startTime: new Date(new Date().setHours(8,0,0,0)), // 8:00 AM
            endDate: new Date(initialEndDate),
            endTime: new Date(new Date().setHours(8,0,0,0)), // 8:00 AM
            reviewStartDate: new Date(initialEndDate),
            reviewStartTime: new Date(new Date().setHours(9,0,0,0)), // 9:00 AM
            reviewEndDate: new Date(initialEndDate),
            reviewEndTime: new Date(new Date().setHours(13,0,0,0)), // 1:00 PM
            logo: "", // logo.uri will be changed to thumbnail once we upload it to the storage and get the url
            prizes: [],
            currency: "",
            totalPrizes: "",
            prizePositionCounter: 0,
            showDateTimePicker_startDate: false,
            showDateTimePicker_startTime: false,
            showDateTimePicker_endDate: false,
            showDateTimePicker_endTime: false,
            showDateTimePicker_reviewStartDate: false,
            showDateTimePicker_reviewStartTime: false,
            showDateTimePicker_reviewEndDate: false,
            showDateTimePicker_reviewEndTime: false,
            isSubmiting: false
        }
    }

    async updateHackathon(){
      const { startDate, startTime, endDate, endTime, reviewStartDate, reviewStartTime, reviewEndDate, reviewEndTime } = this.state

      const startDateTime = mergeDateTime( startDate, startTime )
      const endDateTime = mergeDateTime( endDate, endTime )
      const reviewStartDateTime = mergeDateTime( reviewStartDate, reviewStartTime )
      const reviewEndDateTime = mergeDateTime( reviewEndDate, reviewEndTime )

      // thumbnail is later
      const hackathon = {
        name: this.state.name,
        tagline: this.state.tagline,
        description: this.state.description,
        city: this.state.city,
        criteria: this.state.criteria,
        maxTeams: parseInt(this.state.maxTeams),
        maxInTeam: parseInt(this.state.maxInTeam),
        minInTeam: parseInt(this.state.minInTeam),
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        reviewStartDateTime: reviewStartDateTime,
        reviewEndDateTime: reviewEndDateTime,
        currency: this.state.currency,
        totalPrizes: this.state.totalPrizes,
        prizes: this.state.prizes,
      }

      const check = checkHackathon(hackathon)
      if(check.isError){
        Alert.alert('Error', check.text , [{text: 'OK'}], {cancelable: true})
        return
      }
      else {
        this.setState({
          isSubmiting: true
        })

        let thumbnail = this.state.thumbnail
        if(this.state.logo.uri != null){
          const blob = await uriToBlob(this.state.logo.uri)
          const newPhotoRef = await this.uploadThumbnailToStorage(blob,this.state.hackathonId)
          const thumbnailURL = await newPhotoRef.getDownloadURL()
          thumbnail = thumbnailURL
        }

        hackathon["thumbnail"] = thumbnail
        const { uid } = this.props.firebase.getCurrentUser()

        await this.props.firebase.getHackathonDoc(this.state.hackathonId).update(hackathon)

        this.props.navigation.goBack()


      }
    }

    uploadThumbnailToStorage = async (blob, hackathonId) => {
        const { firebase } = this.props
        const { uid } = firebase.getCurrentUser()

        return new Promise((resolve, reject)=>{

        const newPhotoRef = firebase.storage().ref('hackathonImages/'+hackathonId).child('thumbnail.jpg');
        newPhotoRef.put(blob, {contentType: 'image/jpeg'})
            .then(()=>{

              blob.close();

              resolve(newPhotoRef);

            }).catch((error)=>{

              reject(error);

            });

          });


    }

    _showDateTimePicker( type ){
        if( type === "startDate" ){
            this.setState({
              showDateTimePicker_startDate: true
            })
        }
        else if( type === "startTime" ){
            this.setState({
              showDateTimePicker_startTime: true
            })
        }
        else if( type === "endDate" ){
            this.setState({
              showDateTimePicker_endDate: true
            })
        }
        else if( type === "endTime" ){
            this.setState({
              showDateTimePicker_endTime: true
            })
        }
        else if( type === "reviewStartDate"){
            this.setState({
              showDateTimePicker_reviewStartDate: true
            })
        }
        else if( type === "reviewStartTime" ){
            this.setState({
              showDateTimePicker_reviewStartTime: true
            })
        }
        else if( type === "reviewEndDate" ){
            this.setState({
              showDateTimePicker_reviewEndDate: true
            })
        }
        else if( type === "reviewEndTime" ){
            this.setState({
              showDateTimePicker_reviewEndTime: true
            })
        }
    }

    _hideDateTimePicker( type ){
        if( type === "startDate" ){
            this.setState( {
              showDateTimePicker_startDate: false
            } )
        }
        else if( type === "startTime" ){
            this.setState( {
              showDateTimePicker_startTime: false
            } )
        }
        else if( type === "endDate" ){
            this.setState( {
              showDateTimePicker_endDate: false
            } )
        }
        else if( type === "endTime" ){
            this.setState( {
              showDateTimePicker_endTime: false
            } )
        }
        else if( type === "reviewStartDate"){
            this.setState({
              showDateTimePicker_reviewStartDate: false
            })
        }
        else if( type === "reviewStartTime" ){
            this.setState({
              showDateTimePicker_reviewStartTime: false
            })
        }
        else if( type === "reviewEndDate" ){
            this.setState({
              showDateTimePicker_reviewEndDate: false
            })
        }
        else if( type === "reviewEndTime" ){
            this.setState({
              showDateTimePicker_reviewEndTime: false
            })
        }
    }

    setStartDate( date ){
       this.setState( {
         startDate: date,
         showDateTimePicker_startDate: false
       } )
    }

    setStartTime( time ){
        this.setState( {
          startTime: time,
          showDateTimePicker_startTime: false
        } )
    }

    setEndDate( date ){
        this.setState( {
          endDate: date,
          showDateTimePicker_endDate: false
        } )
    }

    setEndTime( time ){
        this.setState( {
          endTime: time,
          showDateTimePicker_endTime: false
        } )
    }

    setReviewStartDate( date ){
       this.setState( {
         reviewStartDate: date,
         showDateTimePicker_reviewStartDate: false
       } )
    }

    setReviewStartTime( time ){
        this.setState( {
          reviewStartTime: time,
          showDateTimePicker_reviewStartTime: false
        } )
    }

    setReviewEndDate( date ){
        this.setState( {
          reviewEndDate: date,
          showDateTimePicker_reviewEndDate: false
        } )
    }

    setReviewEndTime( time ){
        this.setState( {
          reviewEndTime: time,
          showDateTimePicker_reviewEndTime: false
        } )
    }

    // get date in the format dd/mm/yyyy
    get_Day_Month_Year( from ){
        var date = this.state[from]
        return moment(date).format("DD") + "/" + moment(date).format("MM") + "/" + moment(date).format("YYYY")
    }

    // get time in the format hours:min
    get_hours_min( from ){
        var time = this.state[from]
        return moment(time).format("LT")
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
    onChangePrize( item, newInput, type ){
        const newPrizes = this.state.prizes.map(p => {
          if(p.position == item.position){
            const update = p
            update[type] = newInput
            return update
          }
          else
            return p
        })

        this.setState( { prizes: newPrizes } )
    }

    // this method adds a prize to the
    addPrize(){
        var buffer = this.state.prizes
        // create new prize and give it a position
        // this.state.prizePositionCounter will start from 0
        buffer[this.state.prizePositionCounter] = {
            position: this.state.prizePositionCounter + 1,
            type: 'cash',
            value: 0,
            desc: "",
        }
        this.state.prizePositionCounter++;
        this.setState( {
          prizes: buffer,
          prizePositionCounter: this.state.prizePositionCounter++
         } )
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
        this.state.prizePositionCounter--;
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

    // change the Criterion element in criteria array in the state, type in ["name","weight"]
    onChangeCriterion(criterion, newInput, type){
      const newCriteria = this.state.criteria.map(c => {
        if(c.criteriaId == criterion.criteriaId){
          const update = c
          update[type] = newInput
          return update
        }
        else
          return c
      })

      this.setState( { criteria: newCriteria } )
    }

    addCriteria(){
        // new criteria
        var criteria = {
            criteriaId: generateId(),
            name: "",
            weight: "",
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


    async addLogo(){
        let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();
        if( permissionResult === false ){
            alert( "Permission need to add logo" )
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            quality: 1,
        });

        if (pickerResult.cancelled === true) {
          return;
        }
        // change the size of the picture
        pickerResult.width = 75
        pickerResult.height = 75

        this.setState( () => ({ logo: pickerResult }) )
    }
    async componentDidMount(){
      const { hackathonId } = this.props.route.params
      const hackathonDoc = await this.props.firebase.getHackathonDoc(hackathonId).get()
      const hackathon = hackathonDoc.data()

      this.setState({
        hackathonId: hackathon.hackathonId,
        status: hackathon.status,
        name: hackathon.name,
        tagline: hackathon.tagline,
        description: hackathon.description,
        city: hackathon.city,
        criteria: hackathon.criteria,
        maxInTeam: hackathon.maxInTeam,
        maxTeams: hackathon.maxTeams,
        minInTeam: hackathon.minInTeam,
        startDate: new Date(moment(hackathon.startDateTime.seconds*1000).toISOString()),
        startTime: new Date(moment(hackathon.startDateTime.seconds*1000).toISOString()),
        endDate: new Date(moment(hackathon.endDateTime.seconds*1000).toISOString()),
        endTime: new Date(moment(hackathon.endDateTime.seconds*1000).toISOString()),
        reviewStartDate: new Date(moment(hackathon.reviewStartDateTime.seconds*1000).toISOString()),
        reviewStartTime: new Date(moment(hackathon.reviewStartDateTime.seconds*1000).toISOString()),
        reviewEndDate: new Date(moment(hackathon.reviewEndDateTime.seconds*1000).toISOString()),
        reviewEndTime: new Date(moment(hackathon.reviewEndDateTime.seconds*1000).toISOString()),
        thumbnail: hackathon.thumbnail,
        prizes: hackathon.prizes,
        currency: hackathon.currency,
        totalPrizes: hackathon.totalPrizes,
        prizePositionCounter: hackathon.prizes.length
      })
    }

    render() {
        if(this.state.hackathonId === null){
          return (
            <View style={{alignItems: 'center'}}>
              <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
            </View>
          )
        }
        if(this.state.status == "removed"){
          return (
            <Text style={{alignSelf: 'center', margin: 25}}>
              This hackathon has been removed
            </Text>
          )
        }
        if(this.state.isSubmiting){
          return (
            <View style={{alignItems: 'center'}}>
              <ActivityIndicator style={{margin: 25}} size="large" color='#BB86FC' />
              <Text style={{color: '#BB86FC'}}>Updating</Text>
            </View>
          )
        }
        return (
            <KeyboardAwareScrollView>
                <Form>
                    <H3 style={ styles.label } >Hackathon Name</H3>
                    <Text style={ styles.helperTxt }>Make it descriptive and short. Limit 30 chars</Text>
                    <TextInputWithMsg
                        maxLength={30}
                        label="Hackathon name"
                        value={ this.state.name }
                        onChangeText={(name) => {
                            this.setState({
                              name,
                              nameError: ''
                            })
                          }}
                    />

                    <H3 style={ styles.label } >Tagline</H3>
                    <Text style={ styles.helperTxt }>Short tagline to describe your hackathon. Limit 60 chars </Text>
                    <TextInputWithMsg
                        maxLength={60}
                        label="Tagline"
                        value={ this.state.tagline }
                        onChangeText={(tagline) => {
                            this.setState({
                              tagline
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

                    <H3 style={ styles.label } >City</H3>
                    <Text style={ styles.helperTxt }>Which city does the hackathon located in?</Text>
                    <TextInputWithMsg
                        maxLength={30}
                        placeholder={"Riyadh, Jeddah ...etc"}
                        value={ this.state.city }
                        onChangeText={(city) => {
                            this.setState({
                              city
                            })
                          }}
                    />

                    {/**button to add logo ======================================================*/}
                    <View style={ { justifyContent: "center", alignItems: "center", marginTop: 30 } }>
                        <Image
                        style={{width: 75, height: 75}}
                          source={{uri: this.state.logo.uri == null ? this.state.thumbnail : this.state.logo.uri}}
                          />
                    </View>

                    <TouchableOpacity style={ styles.logoBtn } onPress={ () => this.addLogo() }>
                        <Text style={ [styles.btnText,  {color: "#f0b129"}] } >{
                          this.state.logo.uri == null && this.state.thumbnail === "" ?
                            "Add Logo"
                          : "Change Logo"
                        }</Text>
                    </TouchableOpacity>

                    {/**List of criteria*/}
                    <H3 style={ styles.label }>Criteria</H3>
                    {this.state.criteria.map( (item, index) => (
                      <CriterionInput
                        key={index}
                        index={index}
                        item={item}
                        onChangeCriterionName={(item, name) => {
                            this.onChangeCriterion(item, name, "name")
                        }}
                        onChangeCriterionWeight={(item, weight) => {
                            this.onChangeCriterion(item, weight, "weight")
                        }}
                        removeCriteria={this.removeCriteria}
                      />
                    ))}
                    {/**Button to add criteria */}
                    <TouchableOpacity style={ styles.btn } onPress={ () => this.addCriteria() }>
                        <Text style={ styles.add }>Add Criterion</Text>
                    </TouchableOpacity>

                    {/**MaxTeams */}
                    <H3 style={ styles.label }>Maximum number of teams</H3>
                    <TextInputWithMsg
                        maxLength={6}
                        keyboardType={"numeric"}
                        label="Max Teams"
                        value={ this.state.maxTeams.toString() }
                        onChangeText={ ( maxTeams ) => this.add_number_to_state( maxTeams, "maxTeams" ) }
                    />

                    {/**maxInTeam */}
                    <H3 style={ styles.label }>Maximum number of members in a team</H3>
                    <TextInputWithMsg
                        maxLength={3}
                        keyboardType={"numeric"}
                        label="Max members in a team"
                        value={ this.state.maxInTeam.toString() }
                        onChangeText={ ( maxInTeam ) => this.add_number_to_state( maxInTeam, "maxInTeam" )}
                    />

                    {/**minInteam */}
                    <H3 style={ styles.label } >Minimum number of members in a team</H3>
                    <TextInputWithMsg
                        maxLength={3}
                        keyboardType={"numeric"}
                        label="Min members in a team"
                        value={ this.state.minInTeam.toString() }
                        onChangeText={ ( minInTeam ) => this.add_number_to_state( minInTeam, "minInTeam" ) }
                    />





                    {/**Time related components------------------------------------------ */}
                    <H3 style={ [styles.centerBoldHeader, { marginTop: 50 } ]}>Hackathon Duration</H3>
                    <H3 style={ styles.label } >Start Date currently is: { this.get_Day_Month_Year( "startDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "startDate" ) }>
                        <Text style={ styles.change } >Change Start Date</Text>
                    </TouchableOpacity>

                    <View style={ styles.container } >
                        <DateTimePicker
                            mode="date"
                            date={this.state.startDate}
                            minimumDate={ new Date() }
                            isVisible={ this.state.showDateTimePicker_startDate }
                            onConfirm={ (date) => this.setStartDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "startDate" ) }
                        />
                    </View>



                    <H3 style={ styles.label }>Start Time currently is: { this.get_hours_min( "startTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "startTime" ) } >
                        <Text style={ styles.change } >Change Start Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time"
                            date={this.state.startTime}
                            isVisible={ this.state.showDateTimePicker_startTime }
                            onConfirm={ (date) => this.setStartTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "startTime" ) }
                        />
                     </View>

                    <H3 style={ styles.label }>End Date currently is: { this.get_Day_Month_Year( "endDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "endDate" ) } >
                        <Text style={ styles.change } >Change End Date</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="date"
                            date={this.state.endDate}
                            minimumDate={ new Date() }
                            isVisible={ this.state.showDateTimePicker_endDate }
                            onConfirm={ (date) => this.setEndDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "endDate" ) }
                        />
                    </View>

                    <H3 style={ styles.label }>End Time currently is: { this.get_hours_min( "endTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "endTime" ) } >
                        <Text style={ styles.change } >Change End Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time"
                            date={this.state.endTime}
                            isVisible={ this.state.showDateTimePicker_endTime }
                            onConfirm={ (date) => this.setEndTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "endTime" ) }
                        />
                    </View>

                    {/* review period */}
                    <H3 style={ [styles.centerBoldHeader, { marginTop: 10 } ]}>Review Period</H3>
                    <H3 style={ styles.label } >Review Start Date currently is: { this.get_Day_Month_Year( "reviewStartDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "reviewStartDate" ) }>
                        <Text style={ styles.change } >Change Review Start Date</Text>
                    </TouchableOpacity>

                    <View style={ styles.container } >
                        <DateTimePicker
                            mode="date"
                            date={this.state.reviewStartDate}
                            minimumDate={ new Date() }
                            isVisible={ this.state.showDateTimePicker_reviewStartDate }
                            onConfirm={ (date) => this.setReviewStartDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "reviewStartDate" ) }
                        />
                    </View>



                    <H3 style={ styles.label }>Review Start Time currently is: { this.get_hours_min( "reviewStartTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "reviewStartTime" ) } >
                        <Text style={ styles.change } >Change Review Start Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time"
                            date={this.state.reviewStartTime}
                            isVisible={ this.state.showDateTimePicker_reviewStartTime }
                            onConfirm={ (date) => this.setReviewStartTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "reviewStartTime" ) }
                        />
                     </View>

                    <H3 style={ styles.label }>Review End Date currently is: { this.get_Day_Month_Year( "reviewEndDate" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "reviewEndDate" ) } >
                        <Text style={ styles.change } >Change Review End Date</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="date"
                            date={this.state.reviewEndDate}
                            minimumDate={ new Date() }
                            isVisible={ this.state.showDateTimePicker_reviewEndDate }
                            onConfirm={ (date) => this.setReviewEndDate( date ) }
                            onCancel={ () => this._hideDateTimePicker( "reviewEndDate" ) }
                        />
                    </View>

                    <H3 style={ styles.label }>Review End Time currently is: { this.get_hours_min( "reviewEndTime" ) }</H3>
                    <TouchableOpacity style={ styles.btn } onPress={ () => this._showDateTimePicker( "reviewEndTime" ) } >
                        <Text style={ styles.change } >Change Review End Time</Text>
                    </TouchableOpacity>

                    <View style={ styles.container }>
                        <DateTimePicker
                            mode="time"
                            date={this.state.reviewEndTime}
                            isVisible={ this.state.showDateTimePicker_reviewEndTime }
                            onConfirm={ (date) => this.setReviewEndTime( date ) }
                            onCancel={ () => this._hideDateTimePicker( "reviewEndTime" ) }
                        />
                    </View>

                    {/**estimated total prizes value and currency **/}
                    <H3 style={ styles.label }>Currency used in all the prizes*</H3>
                    <View style={{margin: 20, marginBottom: 10}}>
                      <RadioForm
                        radio_props={[{label: "SAR", value: "SAR"}, {label: "Dollar", value: "$"}, {label: "All prizes are non-cash", value: "non-cash"}]}
                        initial={this.state.currency}
                        borderWidth={1}
                        formHorizontal={false}
                        labelHorizontal={true}
                        buttonColor={'rgba(255, 255, 255, 0.87)'}
                        selectedButtonColor={'#BB86FC'}
                        buttonSize={13}
                        labelStyle={{fontSize: 18, color: 'rgba(255, 255, 255, 0.87)', marginBottom:18}}
                        animation={false}
                        onPress={(data) => {
                          this.setState( () => ({
                            currency: data,
                            totalPrizes: data == "non-cash" ? "non-cash" : ""
                          }) )
                        }}
                      />
                    </View>
                    {(this.state.currency !== "non-cash" && this.state.currency !== "") &&
                      <View>
                        <H3 style={ styles.label }>Estimated Total Prizes*</H3>
                        <Text style={ styles.helperTxt }>Give us the total value of all prizes ( number )</Text>
                        <TextInputWithMsg
                          keyboardType={"numeric"}
                            label="Total Prizes"
                            value={ this.state.totalPrizes }
                            onChangeText={ ( totalPrizes ) => this.setState({totalPrizes}) }
                        />
                      </View>
                    }

                    {/**List of Prizes*/}
                    <H3 style={ styles.label }>Prizes</H3>
                    {this.state.prizes.map(( item, index ) => (
                      <PrizeInput
                        key={index}
                        item={item}
                        onChangePrize={this.onChangePrize}
                        removePrize={this.removePrize}
                      />
                    ))}
                    {/**Button to add a prize */}
                    <TouchableOpacity  style={ styles.btn } onPress={ () => this.addPrize() }>
                        <Text style={ styles.add } >Add Prize</Text>
                    </TouchableOpacity>

                    {/* Horizontal line */}
                    <View style={{ borderBottomWidth: 1, borderColor: 'grey', marginTop: 20, marginBottom: 20}} />
                    {/* Create Button */}
                    <Button style={[styles.btn, { margin : 20 }]} onPress={this.updateHackathon}>
                        <Text style={[styles.btnText, { color: '#000' }]}>Update Hackathon</Text>
                    </Button>
                </Form>
            </KeyboardAwareScrollView>
        )
    }
}

function PrizeInput(props) {
  const { item, onChangePrize, removePrize } = props

  return (
    <View>
        <H3 style={ styles.centerBoldHeader }>Prize in position { item.position }</H3>
        <H3 style={ styles.label }>Type of the prize</H3>
        <Text style={ styles.helperTxt }>For example cash or material possession like fridge or TV</Text>
        <View style={{margin: 20, marginBottom: 10}}>
          <RadioForm
            radio_props={[{label: "Cash", value: "cash"}, {label: "Non Cash", value: "non-cash"}]}
            borderWidth={1}
            formHorizontal={false}
            labelHorizontal={true}
            buttonColor={'rgba(255, 255, 255, 0.87)'}
            selectedButtonColor={'#BB86FC'}
            buttonSize={13}
            labelStyle={{fontSize: 18, color: 'rgba(255, 255, 255, 0.87)', marginBottom:18}}
            animation={false}
            onPress={(type) => {
                onChangePrize( item, type, "type" )
            }}
          />
        </View>

        {item.type != null &&
          <View>
            <H3 style={ styles.label }>{
              item.type == 'cash' ?
                "How much the prize?"
              : "What is the prize?"
            }</H3>
            <TextInputWithMsg
                label="value"
                value={ item.value.toString() }
                keyboardType={item.type == 'cash' ? "numeric" : "default"}
                onChangeText={ (value) => {
                    onChangePrize( item, value, "value" )
                }}
            />

            <H3 style={ styles.label } >Description</H3>
            <Text style={ styles.helperTxt }>optional</Text>
            <TextInputWithMsg
                label="describe the prize"
                value={ item.desc }
                onChangeText={ (desc) => {
                    onChangePrize( item, desc, "desc" )
                }}
            />
          </View>
        }

        <TouchableOpacity style={ styles.btn } onPress={ () => removePrize(item)}>
            <Text style={ styles.remove } > Remove Prize </Text>
        </TouchableOpacity>
    </View>
  )
}

function CriterionInput(props) {
  const { item, onChangeCriterionName, onChangeCriterionWeight, removeCriteria, index } = props
  return (
    <View>
        <H3 style={ styles.label }>{index+1}- Criterion Name</H3>
        <TextInputWithMsg
            label="Name"
            value={ item.name }
            onChangeText={ (name) => {
                onChangeCriterionName(item, name)
            }}
        />

        <H3 style={ styles.label }>Weight</H3>
        <TextInputWithMsg
            maxLength={3}
            label="Out of 100"
            value={ item.weight }
            onChangeText={ (weight) => {
                onChangeCriterionWeight(item, weight)
            }}
        />
        <TouchableOpacity style={ styles.btn } onPress={ () => removeCriteria( item )}>
            <Text style={ styles.remove } >Remove Criterion</Text>
        </TouchableOpacity>
    </View>
  )
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
    helperTxt: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.6)',
      marginTop: 5,
      marginLeft: 15,
      marginRight: 15,
      marginBottom: 5
    },
    centerBoldHeader: {
      fontFamily: 'Roboto_medium',
      textAlign: 'center',
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
    change: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#01A299',
        color: '#01A299',
        padding: 10,
        paddingRight: 20,
        paddingLeft: 20,
    },
    remove: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#CF6679',
        color: '#CF6679',
        padding: 10,
    },
    logoBtn: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#f0b129",
        padding: 10,
        alignSelf: 'center',
        justifyContent:'center',
        margin: 40,
    }

  })

// wrap createHackathon component in <firebase.consumer> and export it
export default withFirebaseHOC( EditHackathon );
