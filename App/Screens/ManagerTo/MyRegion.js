import { collection, updateDoc, setDoc, doc, getDoc ,query,where,getDocs,deleteDoc} from 'firebase/firestore';
import { createUserWithEmailAndPassword,getAuth,deleteUser } from 'firebase/auth';
// import {} from 'firebase/admin'
import React, { useState,useEffect } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';


const ManagersScreen = ({route, navigation}) => {
  const uid = route.params.uid;
  console.log("params at MyRegion: ", route);
  const [counter,setCounter] = useState(route.params.counter);
  const userDocID = route.params.userDocID;
  const [managers, setManagers] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChangeVisable,setModalChangeVisable] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [setUsers,setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true)
  const [curManager,setCurManager] = useState({});
  
  
  
  const handleDeleteManager = (item) => {
    Alert.alert('Confirmation', 'Are you sure you want to delete this manager?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteManager(item) },
    ]);
  };
  const deleteHours = async (user) =>{
    console.log("user id is: "+ user.get('layer'))
    try {
      let q = query(collection(FIREBASE_DB, 'Hours'), where('VID', '==', user.get("layer"))); // the query
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty){
        console.log("didnt find any hours for this volunteer from ", user.get('layer'), " layer");
        return;
      }
      else{
        querySnapshot.forEach(doc => {
          console.log(doc)
          deleteDoc(doc.ref);
          })
      }
    } catch (error) {
      console.log("3");
      console.log("Error fetching events data: ", error);
    }
    finally{
      setLoading(false);
    }
  }
  const deleteusers = async (item) => {
    console.log("delete this manager:"+ item.layer)
    try {
      let q = query(collection(FIREBASE_DB, 'users'), where('manager', '==', item.layer)); // the query
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty){
        console.log("didnt find any hours for this volunteer from ", item.layer, " layer");
      }
      else{
        querySnapshot.forEach(user => {
          console.log(user.id)
          deleteHours(user)
          deleteUser(user.id)
          deleteDoc(user.ref)
          })
      }
    } catch (error) {
      console.log("2");
      console.log("Error fetching events data: ", error);
    }
    finally{
      setLoading(false);
    }
  }
  const deleteManager = (item) => {
    console.log("delete this manager: "+typeof item);
    deleteusers(item);
    // deleteUser(item.id);
    deleteDoc(item.ref)
    fetchData();
    // setManagers((prevManagers) => prevManagers.filter((manager) => manager.id !== id));
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
        console.log("didnt find any hours for this volunteer from ", uid, " layer");
      }
      else{
        querySnapshot.forEach(user => {
          console.log("found users from this manager");
          console.log(user.get('layer'));
          users.push({ref:user.ref,id:user.id, name: user.get('name'), layer: user.get('layer'),email:user.get('email')});
          counter++;
          })
          console.log(users);
          setSelectedUsers(users);
      }
    } catch (error) {
      console.log("1");
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
  const handleEditManager = (item) => {
    // Logic for handling the edit manager functionality
    console.log('Edit manager with ID:', item.layer);
    setCurManager(item);
    setModalChangeVisable(true);
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
      fetchData();
      setModalVisible(false);
    })
    .catch((error) => {
      // error signing up user
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("error code: " + errorCode + ": " + errorMessage);
      Alert.alert('Registration Failed!', 'Error code: ' + errorCode + '\nError message: ' + errorMessage + '\n', [{ text: 'OK' }]);
    })
    
  };
  const editManager = () => {
    console.log("cur manager is:"+curManager.id);
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
      updateDoc(doc(collection(FIREBASE_DB, 'users'), curManager.id), {
        layer: curManager.layer,
        manager: uid,
        name: newManager.name,
        email: newManager.email,
      })
      setModalChangeVisable(false);
      fetchData();
    });
  }
  const cancelEditManager = () => {
    setNewManagerName('');
    setNewManagerEmail('');
    setNewManagerPassword('');
    setModalChangeVisable(false);
  }

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
      <Text style = {styles.managerCode}>{item.layer}</Text>
      <TouchableOpacity onPress={() => handleEditManager(item)} style={styles.editButton}>
      <Ionicons name="pencil" size={24} color="black" />
    </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteManager(item)} >
        <Ionicons name='trash-bin-outline' size={24} color="#333"/>
      </TouchableOpacity>
      
    </View>
  );
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
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
      <Modal visible={modalChangeVisable} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Manager</Text>

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
            <Button title="Change" onPress={editManager} />
            <Button title="Cancel" onPress={cancelEditManager} color="red" />
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
    marginBottom: 10,
    backgroundColor:'#e2e5d1',
    borderBottomColor: '#ccc',
    borderRadius:7,
    padding:10
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
  managerCode: {
    fontSize: 14,
    color: 'gray',
    justifyContent:'center',
    marginLeft:20,
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
  editButton: {
    marginRight: 10,
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
