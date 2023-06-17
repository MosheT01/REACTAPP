import React, { useState, useEffect } from 'react';
import { View, Text,  TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";


  




const MainScreen = ({ route, navigation }) => {
  //////////////////checking userType
  const vid = route.params;
  const userID = String(vid); // user id
  const layers = userID.split('.');

  const [userType, setUserType] = useState([]);

  useEffect(() => {
    if (layers.length === 4) {
      setUserType("volunteer"); // user is volunteer
    } else if (layers.length === 3) {
      setUserType("schoolManager"); // user is school manager
    } else if (layers.length === 2) {
      setUserType("regionalManager"); // user is regional manager
    } else if (layers.length === 1) {
      setUserType("admin"); // user is admin
    } else {
      console.log("valid user type not found");
    }
  }, [layers]);
  /////////////////////////////////////checking user type


    const handleNavigate = (screenName,params) => {
        navigation.navigate(screenName, params);
    }




    return (
      <View style={styles.container}>
        
        <Image
          source={require("../../../App/assets/logo.webp")}
          style={styles.backgroundImage}
        />
        <TouchableOpacity style={styles.profileButton} onPress={()=>handleNavigate('Profile',userID)}>
          <Icon name="user-circle" size={50} color="#000" />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("Hours",userID)}
          >
            <Icon name="clock-o" size={100} />

            <Text style={styles.buttonText}>דוח שעות</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("Event",userID)}
          >
            <Icon name="calendar" size={90} color="#000" />

            <Text style={styles.buttonText}>אירועים</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("Certificates",userID)}
          >
            <Icon
              name="graduation-cap"
              type="font-awesome"
              size={90}
              color="black"
            />

            <Text style={styles.buttonText}>תעודות הוקרה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("pdfMS",{userID,type:"volunteer"})}
          >
            <Icon name="file" size={90} color="black" />

            <Text style={styles.buttonText}>חומרי לימוד</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("inbox")}
          >
            <Icon name="envelope" size={90} color="black" />

            <Text style={styles.buttonText}>Messages</Text>
          </TouchableOpacity> */}

          
          {userType==="schoolManager" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigate("MySchool")}
          >
            <Icon name="university" size={90} color="#000" />
            <Text style={styles.buttonText}>ניהול בית ספר</Text>
          </TouchableOpacity>
        )}
        
        </View>
        <View style={styles.line} />

        <View style={styles.footerContainer}>
          <View style={styles.line} />
        </View>


      
      
      </View>
    );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },

  profileButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  profileIcon: {
    width: 50,
    height: 50,
  },
  backgroundImage: {
    height: 100,
    width: 150,
    marginBottom: 30,
    marginTop: 30,
  },
  buttonContainer: {
    flex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 150,
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: "bold",
    marginTop: 5,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  line: {
    marginBottom: 20,
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
});


export default MainScreen;
