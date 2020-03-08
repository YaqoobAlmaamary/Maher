import React, { Component } from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "native-base"
import RNPicker from "rn-modal-picker"
import { countries } from "../../utils/countries"

export default class CountryPicker extends Component {
  state = {
    placeHolderText: "Select",
    selectedText: ""
  }

  _selectedValue(index, item) {
    this.setState({ selectedText: item.name })
    this.props.setCountry(item.name)
  }

  render() {
    return (
      <RNPicker
        dataSource={countries}
        dummyDataSource={countries}
        defaultValue={this.props.selectedLabel == '' ? false : true}
        pickerTitle={"Please select your country"}
        showSearchBar={true}
        disablePicker={false}
        changeAnimation={"slide"}
        searchBarPlaceHolder={"Search....."}
        showPickerTitle={true}
        searchBarContainerStyle={Styles.searchBarContainerStyle}
        pickerStyle={Styles.pickerStyle}
        pickerItemTextStyle={Styles.listTextViewStyle}
        selectedLabel={this.props.selectedLabel}
        placeHolderLabel={this.state.placeHolderText}
        selectLabelTextStyle={Styles.selectLabelTextStyle}
        placeHolderTextStyle={Styles.placeHolderTextStyle}
        dropDownImageStyle={Styles.dropDownImageStyle}
        selectedValue={(index, item) => this._selectedValue(index, item)}
      />
    )
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },

  searchBarContainerStyle: {
    marginBottom: 10,
    flexDirection: "row",
    height: 40,
    backgroundColor: "#121212",
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10
  },

  selectLabelTextStyle: {
    color: '#BB86FC',
    textAlign: "left",
    width: "99%",
    padding: 10,
    flexDirection: "row"
  },
  placeHolderTextStyle: {
    color: "rgba(255, 255, 255, 0.60)",
    padding: 10,
    textAlign: "left",
    width: "99%",
    flexDirection: "row"
  },
  dropDownImageStyle: {
    marginLeft: 10,
    width: 10,
    height: 10,
    alignSelf: "center"
  },
  listTextViewStyle: {
    backgroundColor: "#2f2f2f",
    color: "rgba(255, 255, 255, 0.87)",
    marginVertical: 10,
    flex: 0.9,
    marginLeft: 20,
    marginHorizontal: 10,
    textAlign: "left"
  },
  pickerStyle: {
    marginLeft: 18,
    paddingRight: 25,
    marginRight: 10,
    marginBottom: 2,
    borderWidth:1,
    backgroundColor: "#2f2f2f",
    borderRadius: 5,
    flexDirection: "row"
  }
})
