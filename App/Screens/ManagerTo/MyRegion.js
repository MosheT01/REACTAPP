import { collection, updateDoc, setDoc, doc, getDoc ,query,where,getDocs} from 'firebase/firestore';
import { createUserWithEmailAndPassword,getAuth,importuser } from 'firebase/auth';
import React, { useState,useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../firebaseConfig';


const ManagersScreen = ({route,navigation}) => {
  const uid = route.params.uid;
  const [counter,setCounter] = useState(route.params.counter);
  const userDocID = route.params.userDocID;
  const [managers, setManagers] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [setUsers,setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true)
  const handleDeleteManager = (id) => {
    Alert.alert('Confirmation', 'Are you sure you want to delete this manager?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteManager(id) },
    ]);
  };

  const deleteManager = (id) => {
    setManagers((prevManagers) => prevManagers.filter((manager) => manager.id !== id));
  };

  const fetchData = async () => {
    let counter = 0;
    try {
      let users = new Array();
      // building layerID to check for events from any layer(school manager or regional manager)
      const auther = getAuth();
      console.log(auther);
      let q = query(collection(FIREBASE_DB, 'users'), where('manager', '==', uid)); // the query
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty){
        console.log("didnt find any hours for this volunteer from ", layerID, " layer");
      }
      else{
  
        users.push({ label: "Names", value: ""});
        querySnapshot.forEach(user => {
          console.log("found users from this manager");
          console.log(user.get('layer'));
          users.push({ name: user.get('name'), layer: user.get('layer'),email:user.get('email')});
          counter++;
          })
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
      name: newManagerName.trim(),
      email: newManagerEmail.trim(),
      password: newManagerPassword.trim(),
    };
    createUserWithEmailAndPassword(FIREBASE_AUTH, newManager.email, newManager.password)
    .then(async (userCredential) => {
      setDoc(doc(collection(FIREBASE_DB, 'users'), userCredential.user.uid), {
        layer: uid + "." + counter,
        manager: uid,
        name: newManager.name,
        email:newManager.email,
      });
      const docSnap = await getDoc(doc(collection(FIREBASE_DB, 'users'), userDocID));
      console.log(userCredential.user.email + "  registered successfully!");
      console.log("new user id: ", userCredential.user.uid);
      if (docSnap.exists()){
        updateDoc(doc(collection(FIREBASE_DB,'users'),userDocID),{numberOfUsers: docSnap.get('numberOfUsers') + 1});
        setCounter(counter+1);
      }
    })
    .catch((error) => {
      // error signing up user
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("error code: " + errorCode + ": " + errorMessage);
      Alert.alert('Registration Failed!', 'Error code: ' + errorCode + '\nError message: ' + errorMessage + '\n', [{ text: 'OK' }]);
    })
    if (loading) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }
    
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
      <Text style = {styles.managerEmail}>{item.layer}</Text>
      <TouchableOpacity onPress={() => handleDeleteManager(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Managers</Text>

      <FlatList
        data={setUsers}
        renderItem={renderManagerItem}
        id={(item) => item.uid}
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
    justifyContent:'center',
    flex: 1,
  },
  managerEmail: {
    fontSize: 14,
    color: 'gray',
    justifyContent:'center',
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
