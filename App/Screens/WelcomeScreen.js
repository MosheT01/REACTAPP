//ready.
import React, { useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from './../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getDoc, collection, doc, setDoc, query, where, getDocs, documentId } from 'firebase/firestore';
import { View, TextInput, Button, StyleSheet, Text, Image, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [layerCode, setLayerCode] = useState('');
  const [registerMode, setRegisterMode] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Add state for button disable/enable

  const handleLogin = () => {
    console.log("logging in...");
    setIsButtonDisabled(true); // Disable button
    signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
      .then(async (userCredential) => {
        console.log("logged in, checking user type");
        const docSnap = await getDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid));
        if (docSnap.exists()) {
          const userID = String(docSnap.get('layer')); // user id
          const layers = userID.split('.');
          // TODO: testing - test if logging in to each type of user
          if (layers.length === 4) navigation.navigate("Main", userID); // user is volunteer
          else if (layers.length === 3) navigation.navigate("MainMS", userID); // user is school manager
          else if (layers.length === 2) navigation.navigate("MainMT", {uid:userID,
            counter:docSnap.get('numberOfUsers'),
            userDocID: userCredential.user.uid,
          }); // user is regional manager
          else if (layers.length === 1) navigation.navigate("MainM",{uid:userID,
            counter:docSnap.get('numberOfUsers'),
            userDocID: userCredential.user.uid,
          }); // user is regional manager); // user is admin
          else console.log("valid user type not found");
        } else {
          console.log("ERROR: user data not found");
          Alert.alert('Error', 'User data not found. Please check your email and password.', [{ text: 'OK' }]);
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error Code: ", errorCode, "\nError Message: ", errorMessage);
        Alert.alert('Error', 'User data not found. Please check your email and password.', [{ text: 'OK' }]);
      })
      .finally(() => {
        setIsButtonDisabled(false); // Enable button
      });
  };

  const handleForgotPassword = () => {
    setForgotPasswordMode(true);
  };

  const handlePasswordReset = () => {
    setIsButtonDisabled(true); // Disable button
    sendPasswordResetEmail(FIREBASE_AUTH, email)
      .then(() => {
        Alert.alert('Password Reset', 'A password reset email has been sent to your email address.', [
          { text: 'OK', onPress: handleBackToLogin },
        ]);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error Code: ", errorCode, "\nError Message: ", errorMessage);
        Alert.alert('Error', 'Failed to send password reset email. Please try again.', [{ text: 'OK' }]);
      })
      .finally(() => {
        setIsButtonDisabled(false); // Enable button
      });
  };

  const handleRegister = () => {
    setRegisterMode(true);
  };

  const handleBackToLogin = () => {
    setRegisterMode(false);
    setForgotPasswordMode(false);
  };

  const handleRegisterSubmit = async () => {
    if (layerCode.split('.').length !== 3) {
      console.log("invalid school code");
      Alert.alert('Error', 'Invalid School Code', [{ text: 'OK' }]);
      return;
    }
    console.log("registering user...");
    setIsButtonDisabled(true); // Disable button

    // query check if the manager exists
    const q = query(collection(FIREBASE_DB, 'users'), where('layer', '==', layerCode));
    const managerSnapshot = await getDocs(q);
    if (managerSnapshot.empty) {
      console.log("School not found")
      Alert.alert('Error', 'School not Found! Enter A valid School Code!', [{ text: 'OK' }]);
      setIsButtonDisabled(false); // Enable button
      return;
    }

    createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
      .then((userCredential) => {
        setDoc(doc(collection(FIREBASE_DB, 'users'), userCredential.user.uid), {
          layer: layerCode + "." + userCredential.user.uid,
          manager: layerCode,
          name: name,
        });
        console.log(userCredential.user.email + "  registered successfully!");
      })
      .catch((error) => {
        // error signing up user
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error code: " + errorCode + ": " + errorMessage);
        Alert.alert('Registration Failed!', 'Error code: ' + errorCode + '\nError message: ' + errorMessage + '\n', [{ text: 'OK' }]);
      })
      .finally(() => {
        setIsButtonDisabled(false); // Enable button
        handleLogin();
      });
  };

  if (forgotPasswordMode) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/logo.webp')} style={styles.logo} />
        <View style={styles.form}>
          <Text style={styles.description}>
            In order to change your password, please enter your email in the box below:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <Button title="Reset Password" onPress={handlePasswordReset} disabled={isButtonDisabled} />
        </View>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink} onPress={handleBackToLogin}>Login Here.</Text>
        </Text>
      </View>
    );
  }

  if (registerMode) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/logo.webp')} style={styles.logo} />
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="email"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={text => setPassword(text)}
            value={password}
          />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            onChangeText={text => setName(text)}
            value={name}
          />
          <TextInput
            style={styles.input}
            placeholder="School Code"
            onChangeText={text => setLayerCode(text)}
            value={layerCode}
          />
          <Button title="Register" onPress={handleRegisterSubmit} disabled={isButtonDisabled} />
        </View>
        <Text style={styles.registerText}>
          Already have an account? <Text style={styles.loginLink} onPress={handleBackToLogin}>Login here.</Text>
        </Text>
      </View>
    );
  }

  //TODO front Animation: loading...
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.webp')} style={styles.logo} />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="email"
          onChangeText={text => setEmail(text)}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={text => setPassword(text)}
          value={password}
        />
        <Button title="Log In" onPress={handleLogin} disabled={isButtonDisabled} />
        <Text style={styles.forgotPasswordLink} onPress={handleForgotPassword}>Forgot Password?</Text>
      </View>
      <Text style={styles.registerText}>
        Don't have an account? <Text style={styles.registerLink} onPress={handleRegister}>Register here</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 100,

  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  form: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  registerText: {
    marginTop: 16,
    fontSize: 14,
    color: 'gray',
  },
  registerLink: {
    fontWeight: 'bold',
    color: 'blue',
    textDecorationLine: 'underline',
  },
  forgotPasswordLink: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'blue',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 100,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  form: {
    width: '80%',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  loginText: {
    marginTop: 16,
    fontSize: 14,
    color: 'gray',
  },
  loginLink: {
    fontWeight: 'bold',
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
export default LoginScreen;
