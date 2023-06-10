import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Linking,Modal,TextInput,Button,
} from "react-native";
import { Picker } from '@react-native-picker/picker'; // Updated import statement
import Icon from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as DocumentPicker from 'expo-document-picker';

function Pdf({ route, navigation }) {
  const vid = route.params;
  const userID = String(vid); // user id
  const layers = userID.split('.');
  const [selectedFile, setSelectedFile] = useState(null);

 

  const [userType, setUserType] = useState([]);

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
  const schoolList = ["School A", "School B", "School C"];

  // Fetch PDF data from server or local storage
  useEffect(() => {
    // Your code here to fetch the PDF data, which should be an array of objects containing a name, photo URL, description, and pdfUrl for each PDF
    // Example data:
    const pdfData = [
      {
        name: "PDF 1",
        description: "description 1",
        school: "School A",
        pdfUrl:
          "https://leoro.org.il/wp-content/uploads/2021/10/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%9C%D7%92%D7%99%D7%9C-%D7%94%D7%96%D7%94%D7%91-%D7%97%D7%93%D7%A9-1.pdf",
      },
      {
        name: "PDF 2",
        description: "description 2",
        school: "School B",
        pdfUrl: "https://example.com/pdf2.pdf",
      },
      // ...rest of the PDF data
    ];
    setPdfList(pdfData);
    setFilteredPdfList(pdfData);
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
  

  const downloadPdf = (url) => {
    Linking.openURL(url);
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
    if (!pdfName || !pdfDescription || !pdfUrl) {
      alert("Please fill in all fields");
      return;
    }

    // Create a new PDF object
    const newPdf = {
      name: pdfName,
      description: pdfDescription,
      pdfUrl: pdfUrl,
      school: selectedSchool,
    };

    // Update the PDF list
    setPdfList((prevPdfList) => [...prevPdfList, newPdf]);

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
        setSelectedFile(result.uri);
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
              <View>
              <Button title="Attach File" onPress={handleFileSelection} />
              {selectedFile && (
                <Text>Selected File: {selectedFile.name}</Text>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="PDF URL"
              placeholderTextColor="#999"
              value={pdfUrl}
              onChangeText={(text) => setPdfUrl(text)}
            />
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