import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Linking,Modal,TextInput,Button,window ,Alert 
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // Updated import statement
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as DocumentPicker from 'expo-document-picker';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_STORAGE } from "../../../firebaseConfig";
import { getStorage, ref, getDownloadURL,uploadBytesResumable,listAll,deleteObject } from "firebase/storage";
import { doc,setDoc,collection,getDocs,query } from "firebase/firestore";


function Pdf({ route, navigation }) {
  const vid = route.params.uid;
  
  const userID = String(vid); // user id
  const layers = userID.split('.');
  const [selectedFile, setSelectedFile] = useState([]);
  const [userType, setUserType] = useState(route.params.type);
  const [pdfCatagory,setCatagory] = useState("");
  const [fileName,setFileName] = useState("");
  const [blobFile,setBlobFile] = useState("");
  const [downloadAble,setDownloadable] = useState("");

  /////////////////////////////////////checking user type
  const [pdfList, setPdfList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [filteredPdfList, setFilteredPdfList] = useState([]);
  const [schoolList,setSchoolList] = useState([]);
  const [extraData,setExtraData] = useState(false);
  const fetchData = async () => {
    setSchoolList([]);
    setPdfList([]);
    console.log(userType)
    if(userType === 'volunteer'){
      const listref = ref(FIREBASE_STORAGE,'pdfs/מתנדבים/');
          listAll(listref).then((itemsRef)=>{
            itemsRef.prefixes.forEach((itemRef)=>{
              listAll(itemRef).then((Ref)=>{
              Ref.items.forEach((Re)=>{
                const newPdf = {
                  name: Re.name,
                  pdfUrl: Re.fullPath,
                  school: Re.parent.name,
                };
                setPdfList((prevPdfList) => [...prevPdfList, newPdf]);
              });
              // Update the PDF list
  
            })
            setSchoolList((prevSchollList)=>[...prevSchollList,itemRef.name]);
          })
            })
    }
    if (userType === 'regionalManager' || userType === 'schoolManager'){
      const listref = ref(FIREBASE_STORAGE,'pdfs/');
      listAll(listref).then((res)=>{
        res.prefixes.forEach((folderRef)=>{
          listAll(folderRef).then((itemsRef)=>{
            itemsRef.prefixes.forEach((itemRef)=>{
              listAll(itemRef).then((Ref)=>{
              Ref.items.forEach((Re)=>{
                const newPdf = {
                  name: Re.name,
                  pdfUrl: Re.fullPath,
                  school: Re.parent.name,
                  ref:Re,
                };
                setPdfList((prevPdfList) => [...prevPdfList, newPdf]);
              });
              // Update the PDF list
  
            })
            setSchoolList((prevSchollList)=>[...prevSchollList,itemRef.name]);
          })
            })
            
          })
      })
    }
    console.log(schoolList)

    
  }
  // Fetch PDF data from server or local storage
  useEffect(() => {
    // Your code here to fetch the PDF data, which should be an array of objects containing a name, photo URL, description, and pdfUrl for each PDF
    // Example data:
    fetchData();
   }, []);

  //this function will be called whenever the selected school changes:
  const filterPdfList = (selectedSchool) => {
    if (selectedSchool === ""){
      setFilteredPdfList(pdfList); // No filter applied, show all PDFs
    } else {
      const filteredList = pdfList.filter((pdf) => pdf.school === selectedSchool || pdf.school==="");
      setFilteredPdfList(filteredList);
    }
  };
  const downloadPdf = async (url) => {
    getDownloadURL(ref(FIREBASE_STORAGE, url))
    .then((url) => {
    Linking.openURL(url);
  }).catch((error) => {
    console.log(error);
  });

  };

  const renderPdfItem =  ({ item, index }) => {
    const deletePdf = async () => {
      // Create a copy of the PDF list
      deleteObject(item.ref);
      const updatedPdfList = [...filteredPdfList];
      // // Remove the PDF at the specified index
      updatedPdfList.splice(index, 1);
      setPdfList(updatedPdfList);
      // console.log(pdfList);
      // Update the PDF list
      setFilteredPdfList(updatedPdfList)
      // console.log(filteredPdfList);
    };


    return (
      <View style={styles.pdfItem}>
        <TouchableOpacity onPress={() => downloadPdf(item.pdfUrl)}>
          <Icon name="file" size={90} color="black" style={styles.pdfPhoto} />
        </TouchableOpacity>

        <View style={styles.pdfInfo}>
          <Text style={styles.pdfName}>{item.name}</Text>
          <Text style={styles.pdfDescription}>{item.description}</Text>
        </View>

        {userType === "regionalManager" && (
        <TouchableOpacity onPress={()=>Alert.alert('Error', 'Are you sure you want to delete the file?', [
          {text: 'OK', onPress: () => deletePdf()},
          {text:'Cancel'}])}>
          <Icon name="trash" size={30} color="red" />
        </TouchableOpacity>
      )}
      </View>
    );
  };

  const addPdf = () => {
    
    // Validate the input fields
    if (!pdfName || !pdfDescription ) {
      alert("Please fill in all fields");
      return;
    }
    if (!blobFile) return;
    const storageRef = ref(FIREBASE_STORAGE, 'pdfs/'+pdfCatagory+"/"+ fileName); //LINE A
    const uploadTask = uploadBytesResumable(storageRef, blobFile); //LINE B
    uploadTask.on(
      "state_changed", null ,
      (error) => console.log(error),
      () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => { //LINE C
              console.log("File available at", downloadURL);
              
          });

      }
    );
    // const storage = getStorage();
    // const mountainsRef = ref(storage,'pdfs/'+pdfCatagory+"/"+pdfName);

    // // const metadata = {
    // //   contentType: 'application/pdf',
    // // };
    // console.log(selectedFile);
    // // Upload the file and metadata
    // uploadBytesResumable(mountainsRef, selectedFile).then((snapshot) => {
    //   console.log("File uploaded successfully");
    //   // Handle successful upload
    // })
    // .catch((error) => {
    //   console.error("Error uploading file", error);
    //   // Handle error
    // });;
    
    // const new_url_ref = PutFile(mountainsRef)

    //Create a new PDF object
    // Update the PDF list
    // setPdfList((prevPdfList) => [...prevPdfList, newPdf]);

    // Reset the input fields and close the modal

  };
  const handleFileSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'ios' ? 'application/pdf' : '/',
      });

      if (result.type === 'success') {
        const r = await fetch(result.uri);
        const b = await r.blob();
        setFileName(result.name)
        setBlobFile(b);
        //setIsChoosed(true) 
        // Handle the selected file, e.g., upload it to a server
      } else {
        setSelectedFile(null);
        // Handle cancellation or any other error
      }
    } catch (error) {
      console.log('Error picking file:', error);
    }
  };

  return (
    <View style={styles.container}>
       {/* Filter section */}
      <Picker
        selectedValue={selectedSchool}
        onValueChange={(itemValue) => {
          setSelectedSchool(itemValue);
          filterPdfList(itemValue);
        }}
        style={styles.filterPicker}
      >
        <Picker.Item label="סוג התנדבות" value="" />
        {schoolList.map((school) => (
          <Picker.Item label={school} value={school} key={school} />
        ))}
      </Picker>

    {/* PDF list */}
      <FlatList
        data={filteredPdfList}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.name}
        extraData={extraData}
      />

      {/* Modal for adding a PDF */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAwareScrollView>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add PDF</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#999"
              value={pdfName}
              onChangeText={(text) => setPdfName(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#999"
              value={pdfDescription}
              onChangeText={(text) => setPdfDescription(text)}
            />

            <TextInput
              style={styles.input}
              placeholder="pdfCatagory"
              placeholderTextColor="#999"
              value={pdfCatagory}
              onChangeText={(text) => setCatagory(text)}
            />
              <View>
              <Button title="Attach File" onPress={handleFileSelection} />
              {fileName && (
                <Text>File: {fileName}</Text>
              )}
            </View>
            {/* <TextInput
              style={styles.input}
              placeholder="PDF URL"
              placeholderTextColor="#999"
              value={pdfUrl}
              onChangeText={(text) => setPdfUrl(text)}
            /> */}

            <View style={styles.modalButtons}>
              <Button title="Add" onPress={addPdf} />

              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setPdfName("");
                  setPdfDescription("");
                  setPdfUrl("");
                }}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </Modal>

    {/* Button to open the modal (visible only for school managers) */}
    {userType === "regionalManager" && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  pdfItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  pdfPhoto: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  pdfDescription: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop:200,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#00bfff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
});

export default Pdf;