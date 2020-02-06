import React, { Component } from 'react'
import { View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import TextButton from '../components/TextButton'


export default class DateButton extends Component {
  state = {
    show: false,
  }

  showDatepicker = () => {
    this.setState({
      show: true,
    });
  }

  setDateState = (event, date) => {
    date = date || this.state.date;
    this.setState({
      show: Platform.OS === 'ios' ? true : false,
      date,
    })
    this.props.setDate(date)
  }
  render() {
    const { show } = this.state
    const { date, setDate } = this.props

    return (
      <View>
        <View style= {{alignSelf: 'center'}}>
          <TextButton onPress={this.showDatepicker} style={{fontSize:18, letterSpacing: 1.0, textTransform: 'capitalize'}}>
            {date == '' ? 'Select Date' : 'Change Date'}
          </TextButton>
        </View>
        { show && <DateTimePicker
                    value={date == '' ? new Date('1995-06-12') : date}
                    maximumDate={new Date(2020, 1, 1)}
                    mode={'date'}
                    display={ Platform.OS === 'ios' ? "default" : "spinner" }
                    onChange={this.setDateState} />
        }
      </View>
    )
  }
}
