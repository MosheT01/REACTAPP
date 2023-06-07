import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  deleteButton: {
    marginRight: 30,
    padding: 5,
  },
  editButton: {
    marginRight: 30,
    padding: 5,
  },
  messageButton: {
    padding: 5,
    marginRight: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  inputField: {
    height: 100,
    textAlignVertical: "top",
  },
};

const StudentList = ({ navigation ,route }) => {

  const id = route.params.schoolID
  const [students, setStudents] = useState([
    { id: 1, name: "student 0" },
    { id: 2, name: "student 1" },
    { id: 3, name: "student 2" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [searchIdText, setSearchIdText] = useState("");
  const [searchNameText, setSearchNameText] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [studentsID, setStudentsID] = useState(0);

  const handleDelete = (id) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== id)
    );
  };

  const handleEdit = (id) => {
    navigation.navigate("ProfileEdit", { id: id });
  };

  const handleSendMessage = (id) => {
    setStudentsID(id)
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleMessageSend = () => {
    // Implement your logic to send the message here
    console.log(`Sending message: ${studentsID}`);
    setModalVisible(false);
    setMessage("");
  };

  const handleSearch = () => {
    const filtered = students.filter((student) =>
      student.id.toString().includes(searchIdText) &&
      student.name.toLowerCase().includes(searchNameText.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item.name}</Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="md-trash" size={30} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editButton]}
          onPress={() => handleEdit(item.id)}
        >
          <Ionicons name="md-create" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.messageButton]}
          onPress={() => handleSendMessage(item.id)}
        >
          <Ionicons name="md-mail" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={filteredStudents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={styles.searchContainer}>
        <KeyboardAwareScrollView>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID"
          placeholderTextColor="#999"
          value={searchIdText}
          onChangeText={(text) => setSearchIdText(text)}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name"
          placeholderTextColor="#999"
          value={searchNameText}
          onChangeText={(text) => setSearchNameText(text)}
        />
        </KeyboardAwareScrollView>
        <Button title="Search" onPress={handleSearch} />
      </View>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={[styles.inputField, { marginBottom: 10 }]}
              placeholder="Enter your message"
              value={message}
              multiline={true}
              onChangeText={(text) => setMessage(text)}
            />
            <View style={styles.buttonContainer}>
              <Button title="Send" onPress={handleMessageSend} />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={handleModalClose} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentList;
