import React from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const MainScreen = ({ navigation }) => {
  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleProfile = () => {
    navigation.navigate("ProfileMT");
  };

 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
        <Icon name="user-circle" size={50} color="#000" />
      </TouchableOpacity>
      <Image
        source={require("../../../App/assets/logo.webp")}
        style={styles.backgroundImage}
      />

      <View style={styles.buttonContainer}>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("EventMT")}
        >
          <Icon name="calendar" size={90} color="#000" />

          <Text style={styles.buttonText}>Region Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("MyRegional")}
        >
          <Icon name="handshake-o" size={90} color="#000" />

          <Text style={styles.buttonText}>Region Manager</Text>
        </TouchableOpacity>
      
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("pdfMT")}
        >
          <Icon name="file" size={90} color="black" />

          <Text style={styles.buttonText}>Region PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigate("inboxMT")}
        >
          <Icon name="envelope" size={90} color="black" />

          <Text style={styles.buttonText}>Messages</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.button} onPress={() =>handleNavigate("StatisticMT")}>
          <Icon name="bar-chart" size={80} color="#000" />

          <Text style={styles.buttonText}>Region Statistics</Text>
        </TouchableOpacity>

      </View>

    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
 
});

export default MainScreen;
