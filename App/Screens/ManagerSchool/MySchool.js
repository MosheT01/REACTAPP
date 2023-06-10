import React, { useState } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';

const ManagersScreen = () => {
  const [managers, setManagers] = useState([
    { id: 1, name: 'John Doe', email: 'johndoe@example.com', password: '123456' },
    { id: 2, name: 'Jane Smith', email: 'janesmith@example.com', password: 'abcdef' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');

  const handleDeleteManager = (id) => {
    Alert.alert('Confirmation', 'Are you sure you want to delete this manager?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteManager(id) },
    ]);
  };

  const deleteManager = (id) => {
    setManagers((prevManagers) => prevManagers.filter((manager) => manager.id !== id));
  };

  const handleAddManager = () => {
    setModalVisible(true);
  };

  const addManager = () => {
    if (
      newManagerName.trim() === '' ||
      newManagerEmail.trim() === '' ||
      newManagerPassword.trim() === ''
    ) {
      Alert.alert('Error', 'Please enter a valid name, email, and password');
      return;
    }

    const newManager = {
      id: managers.length + 1,
      name: newManagerName.trim(),
      email: newManagerEmail.trim(),
      password: newManagerPassword.trim(),
    };

    setManagers((prevManagers) => [...prevManagers, newManager]);
    setNewManagerName('');
    setNewManagerEmail('');
    setNewManagerPassword('');
    setModalVisible(false);
  };

  const cancelAddManager = () => {
    setNewManagerName('');
    setNewManagerEmail('');
    setNewManagerPassword('');
    setModalVisible(false);
  };

  const renderManagerItem = ({ item }) => (
    <View style={styles.managerItemContainer}>
      <Text style={styles.managerName}>{item.name}</Text>
      <Text style={styles.managerEmail}>{item.email}</Text>
      <TouchableOpacity onPress={() => handleDeleteManager(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Managers</Text>

      <FlatList
        data={managers}
        renderItem={renderManagerItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      <TouchableOpacity onPress={handleAddManager} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add New Manager</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Manager</Text>

            <TextInput
              placeholder="Name"
              value={newManagerName}
              onChangeText={(text) => setNewManagerName(text)}
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              value={newManagerEmail}
              onChangeText={(text) => setNewManagerEmail(text)}
              style={styles.input}
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Password"
              value={newManagerPassword}
              onChangeText={(text) => setNewManagerPassword(text)}
              style={styles.input}
              secureTextEntry
            />

            <Button title="Add" onPress={addManager} />
            <Button title="Cancel" onPress={cancelAddManager} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    marginBottom: 16,
  },
  managerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  managerName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  managerEmail: {
    fontSize: 14,
    color: 'gray',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 32,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default ManagersScreen;
