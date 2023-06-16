import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getDoc, collection, doc, setDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import Icon from "react-native-vector-icons/FontAwesome";

const DeleteScreen = () => {
  const deleteHours = async () => {
    const q = query(collection(FIREBASE_DB, 'Hours'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log("didnt find any hours for this volunteer");
      let hoursArray = new Array();
      setHours(hoursArray);
    }
    else {
      console.log("found hours");
      let hoursArray = new Array();
      let totHours = 0;
      querySnapshot.forEach(hour => {
        deleteDoc(hour.ref);
      });
      setHours(hoursArray);
      // setTotalHours(totHours);
    }
  }

  const deleteUsers = async () => {
    try {
      let users = new Array();
      // building layerID to check for events from any layer(school manager or regional manager)
      let q = query(collection(FIREBASE_DB, 'users')); // the query
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // console.log("didnt find any hours for this volunteer from ", layerID, " layer");
      }
      else {
        console.log("found users from this manager");
        querySnapshot.forEach(user => {
          if (user.get('layer').split(".").length == 4) {
            deleteDoc(user.ref);
          }
        });
        console.log(users);
        setSelectedUsers(users);
      }
    } catch (error) {
      console.log("Error fetching events data: ", error);
    }
    finally {
      setLoading(false);
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Perform delete action here
            // You can replace this with your own logic
            deleteHours();
            deleteUsers();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>מסך זה נועד לאתחול המידע כלומר מחיקה של כל השעות האירועים והמתנדבים</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="power-off" size={100} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
  },
  deleteButton: {
    width: 200,
    height: 200,
    backgroundColor: "red",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DeleteScreen;
