import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Linking,Modal,TextInput,Button,window  
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // Updated import statement
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as DocumentPicker from 'expo-document-picker';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_STORAGE } from "../../../firebaseConfig";
import { getStorage, ref, getDownloadURL,uploadBytesResumable,listAll } from "firebase/storage";
import { doc,setDoc,collection,getDocs,query } from "firebase/firestore";
import {createDownloadResumable,downloadAsync} from "expo-file-system"

function Pdf({ route, navigation }) {
  const vid = route.params;
  const userID = String(vid); // user id
  const layers = userID.split('.');
  const [selectedFile, setSelectedFile] = useState([]);
  const [userType, setUserType] = useState([]);
  const [pdfCatagory,setCatagory] = useState("");
  const [fileName,setFileName] = useState("");
  const [blobFile,setBlobFile] = useState("");
  const [downloadAble,setDownloadable] = useState("");
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
  const [pdfList, setPdfList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [filteredPdfList, setFilteredPdfList] = useState([]);
  const [schoolList,setSchoolList] = useState([]);
  const fetchData = async () => {
    const listref = ref(FIREBASE_STORAGE,'pdfs/');
    listAll(listref).then((res)=>{
      res.prefixes.forEach((folderRef)=>{
        listAll(folderRef).then((itemsRef)=>{
          itemsRef.items.forEach((itemRef)=>{
            const newPdf = {
              name: itemRef.name,
              pdfUrl: itemRef.fullPath,
              school: itemRef.parent.name,
            };
            // Update the PDF list
            setPdfList((prevPdfList) => [...prevPdfList, newPdf]);
          })
          })
          setSchoolList((prevSchollList)=>[...prevSchollList,folderRef.name]);
          
      
        })
    })
    setFilteredPdfList(pdfData);
  }
  // Fetch PDF data from server or local storage
  useEffect(() => {
    // Your code here to fetch the PDF data, which should be an array of objects containing a name, photo URL, description, and pdfUrl for each PDF
    // Example data:
    fetchData();
   }, []);

  //this function will be called whenever the selected school changes:
  const filterPdfList = (selectedSchool) => {
    if (selectedSchool === "") {
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

  const renderPdfItem = ({ item, index }) => {
    const deletePdf = () => {
      // Create a copy of the PDF list
      const updatedPdfList = [...pdfList];
      // Remove the PDF at the specified index
      updatedPdfList.splice(index, 1);
      // Update the PDF list
      setPdfList(updatedPdfList);
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

        {userType === "schoolManager" && (
        <TouchableOpacity onPress={deletePdf}>
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
              // isUploadCompleted(true);
              // setPdfUrl(downloadURL);
              setDoc(doc(collection(FIREBASE_DB,'pdfs')),{
                name:fileName,
                url:downloadURL,
                catagory:pdfCatagory,
              })
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
    setPdfName("");
    setPdfDescription("");
    setPdfUrl("");
    setModalVisible(false);
    filterPdfList(selectedSchool);

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
    {userType === "schoolManager" && (
      <Picker
        selectedValue={selectedSchool}
        onValueChange={(itemValue) => {
          setSelectedSchool(itemValue);
          filterPdfList(itemValue);
        }}
        style={styles.filterPicker}
      >
        <Picker.Item label="All Schools" value="" />
        {schoolList.map((school) => (
          <Picker.Item label={school} value={school} key={school} />
        ))}
      </Picker>
    )}

    {/* PDF list */}
      <FlatList
        data={filteredPdfList}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.name}
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
    {userType === "schoolManager" && (
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