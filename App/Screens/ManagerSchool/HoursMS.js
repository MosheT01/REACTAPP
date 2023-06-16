import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FIREBASE_DB } from '../../../firebaseConfig';
import { query, where, collection, getDocs, Timestamp, setDoc,deleteDoc, getDoc } from 'firebase/firestore';


const SelectBox = ({ options, selectedValue, onValueChange,onTouchEnd }) => {
  const pickerStyle = Platform.OS === "ios" ? styles.pickerIOS : styles.picker;

  return (
    <Picker
      style={pickerStyle}
      selectedValue={selectedValue}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <Picker.Item
          id={option.value}
          label={option.label}
          value={option.value}
        />
      ))}
    </Picker>
  );
};


const VolunteerHoursPage = ({route,navigation}) => {
  const uid = route.params;
  const currentDate = new Date();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString()
  );
  const [curUser,setCurrentUser] = useState({});
  const [setUsers, setSelectedUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    (currentDate.getMonth() + 1).toString()
  );
  const [hours, setHours] = useState([]);
  const currentYear = new Date().getFullYear();
  const lastTenYears = Array.from({ length: 2 }, (_, index) => {
    const year = currentYear - index;
    return { label: year.toString(), value: year.toString()};
  });
  const years = lastTenYears;

  const fetchData = async () => {
    try {
      let users = new Array();
      // building layerID to check for events from any layer(school manager or regional manager)
      let q = query(collection(FIREBASE_DB, 'users'), where('manager', '==', uid)); // the query
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty){
        // console.log("didnt find any hours for this volunteer from ", layerID, " layer");
      }
      else{
        console.log("found users from this manager");
        users.push({ label: "Names", value: ""});
        querySnapshot.forEach(user => users.push({ label: user.get('name'), value: user.get('layer')}));
        console.log(users);
        setSelectedUsers(users);
      }
    } catch (error) {
      console.log("Error fetching events data: ", error);
    }
    finally{
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const months = [
    { label: "Select Month", value: "" },
    { label: "January (1)", value: "1" },
    { label: "February (2)", value: "2" },
    { label: "March (3)", value: "3" },
    { label: "April (4)", value: "4" },
    { label: "May (5)", value: "5" },
    { label: "June (6)", value: "6" },
    { label: "July (7)", value: "7" },
    { label: "August (8)", value: "8" },
    { label: "September (9)", value: "9" },
    { label: "October (10)", value: "10" },
    { label: "November (11)", value: "11" },
    { label: "December (12)", value: "12" },
  ];

  const removeItem = (documentReferenceCurrent) => {
    setHours((hours) =>
      hours.filter((hour) => hour['documentReference'] !== documentReferenceCurrent)
    );}

const handleDelete = async (date,documentReference) => {
  await deleteDoc(documentReference);
  removeItem(documentReference);
};

  const handleSearch = async (curUser) => {
    setCurrentUser(curUser);
    console.log(curUser);
    const q = query(collection(FIREBASE_DB, 'Hours'), where('VID', '==', curUser));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty){
          console.log("didnt find any hours for this volunteer");
          let hoursArray = new Array();
          setHours(hoursArray);
        }
        else{
          console.log("found hours");
          let hoursArray = new Array();
          let totHours = 0;
          querySnapshot.forEach(hour => {
            console.log(typeof hour.ref);
            const timestamp = new Timestamp(hour.get('from').seconds, hour.get('from').nanoseconds);
            let date = timestamp.toDate();
            let mm = date.getMonth() + 1;
            let dd = date.getDate();
            let yyyy = date.getFullYear();
            let duration = hour.get('duration');

            totHours += duration;

            hoursArray.push({documentReference: hour.ref,day: dd, month: mm, year: yyyy, duration: duration, date: date});
          });
          setHours(hoursArray);
          // setTotalHours(totHours);
        }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* <View style={styles.inputContainer}> */}
        {/* <TextInput
          style={styles.inputField}
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Enter ID"
        /> */}
        {/* <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity> */}
      {/* </View> */}
      <View style = {styles.inputContainer}>
      <SelectBox 
        options={setUsers}
        selectedValue={curUser}
        // onTouchEnd={handleSearch}
        onValueChange={(itemValue)=>{
          handleSearch(itemValue);
        }}
      >
      </SelectBox>
      </View>
      <View style={styles.inputContainer}>
        <SelectBox
          options={years}
          selectedValue={selectedYear}
          onValueChange={setSelectedYear}
        />
        <SelectBox
          options={months}
          selectedValue={selectedMonth}
          onValueChange={setSelectedMonth}
        />
      </View>
      {/* <Text style={styles.totalHoursText}>Total Hours: {totalHours}</Text> */}
          <KeyboardAwareScrollView style={styles.hourSheetContainer}>
            {hours.filter(hour => hour['year'] == selectedYear && hour['month'] == selectedMonth).map(hour => (
              <View id={hour['date'].seconds} style={styles.hourSheetItem}>
              <Text style={styles.dayText}>Date: {hour['year']}/{hour['month']}/{hour['day']}
              </Text>
              <Text style={styles.hourText}>Hours: {hour['duration']}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>{Alert.alert('Are you sure?', 'Are you sure you want to delete this hours?', [
                {text: 'OK', onPress: () => handleDelete( hour['date'],hour['documentReference'])},
                {text:'Cancel'}])}
              }>
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
              </View>
            ))}
          </KeyboardAwareScrollView>
          
          
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    color: '#000000', // Replace with your desired text color
  },
  inputField: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    backgroundColor: "#333",
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderRadius: 5,
  },
  picker: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerIOS: {
    flex: 1,
    height: 150,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  hourSheetContainer: {
    marginTop: 10,
  },
  hourSheetItem: {
    backgroundColor: "#E8E8E8",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayText: {
    fontSize: 16,
    marginBottom: 5,
  },
  hourText: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#333",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  line: {
    marginBottom: 20,
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
});

export default VolunteerHoursPage;
