import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const MainScreen = ({ route, navigation }) => {
  const {uid, counter, userDocID} = route.params;
  console.log("doc at mainMT: ", userDocID);
  const handleNavigate = (screenName, params) => {
    navigation.navigate(screenName, params);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileButton} onPress={()=>handleNavigate('Profile',uid)}>
        <Icon name="user-circle" size={50} color="#000" />
      </TouchableOpacity>
      <Image
        source={require("../../assets/logo.webp")}
        style={styles.backgroundImage}
      />

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("StorageM",uid)}
        >
          <Icon name="database" size={90} color="#000" />

          <Text style={styles.buttonText}>מחיקת דאטה בייס</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("MyRegion",{uid:uid,counter:counter, userDocID: userDocID})}
        >
          <Icon name="handshake-o" size={90} color="#000" />

          <Text style={styles.buttonText}>ניהול בתי ספר</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("pdfMS",{uid:uid,type:"regionalManager"})}
        >
          <Icon name="file" size={90} color="black" />

          <Text style={styles.buttonText}>מסמכים</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("inbox")}
        >
          <Icon name="envelope" size={90} color="black" />

          <Text style={styles.buttonText}>הודעות</Text>
        </TouchableOpacity>
      </View>

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
  footerText: {
    color: "gray",
  },
  line: {
    marginBottom: 20,
    width: "100%",
    height: 1,
    backgroundColor: "gray",
  },
});

export default MainScreen;
