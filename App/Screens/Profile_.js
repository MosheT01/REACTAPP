import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { query, where, getDoc, doc, collection, getDocs } from "firebase/firestore";
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_STORAGE } from "../../firebaseConfig";

const ProfileScreen = ({ route, navigation }) => {
  const uid = route.params;
  const [volunteerPlace, setVolunteerPlace] = useState("");
  const [name, setName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newValue, setNewValue] = useState("");

  const [shirtSizeModalVisible, setShirtSizeModalVisible] = useState(false);

  const fetchData = async () => {
    const q = query(collection(FIREBASE_DB, 'users'), where('layer', '==', uid));
    const managerSnapshot = await getDocs(q);
    if (managerSnapshot.empty) {
      // Handle empty snapshot
    } else {
      managerSnapshot.forEach(user => {
        setName(String(user.get('name')))
        setVolunteerPlace(String(user.get('volunteerPlaceID')))
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer}>
        <Icon
          name="user-circle"
          size={100}
          color="#000"
          style={styles.profileIcon}
        />
      </View>

      <Text style={styles.title}>פרופיל</Text>

      <View style={styles.fieldContainer}>
        <Icon name="user" size={20} color="#000" style={styles.icon} />
        <Text style={styles.label}>שם פרטי: {name.split(" ")[0]}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Icon name="user" size={20} color="#000" style={styles.icon} />
        <Text style={styles.label}>שם משפחה: {name.split(" ")[1]}</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Icon name="map-marker" size={20} color="#000" style={styles.icon} />
        <Text style={styles.label}>מקום התנדבות: {volunteerPlace}</Text>
      </View>

      <Modal visible={!!modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>שינוי ערך</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="הכנס ערך חדש"
            value={newValue}
            onChangeText={(text) => setNewValue(text)}
          />

          <Button
            title="ביטול"
            onPress={() => {
              setModalVisible(false);
              setNewValue("");
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    fontWeight: "bold",
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    fontSize: 20,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    width: 300,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    textAlign: "right",
  },
});

export default ProfileScreen;
