/*
*
*  Dashboard.tsx
*
*/

import React from 'react';
import { View, Button, Text, Modal, SafeAreaView, ActivityIndicator, FlatList } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native'

// Firebase
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import { sendEmailVerification } from 'firebase/auth';
import { auth, db } from "../../../firebase";

// Styles
import AppStyles from '../../styles/AppStyles';

// Components
import AddToDoModal from '../../components/AddToDoModal';
import InlineTextButton from '../../components/InlineTextButton';

export default function ToDo({ navigation }) {

  let [modalVisible, setModalVisible] = React.useState(false);
  let [isLoading, setIsLoading] = React.useState(true);
  let [isRefreshing, setIsRefreshing] = React.useState(false);
  let [toDos, setToDos] = React.useState([]);

  let loadToDoList = async () => {
    const q = query(collection(db, "todos"), where("userId", "==", auth.currentUser.uid));

    const querySnapshot = await getDocs(q);
    let toDos = [];
    querySnapshot.forEach((doc) => {
      let toDo = doc.data();
      toDo.id = doc.id;
      toDos.push(toDo);
    });

    setToDos(toDos);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  if (isLoading) {
    loadToDoList();
  }

  let checkToDoItem = (item, isChecked) => {
    const toDoRef = doc(db, 'todos', item.id);
    setDoc(toDoRef, { completed: isChecked }, { merge: true });
  };

  let deleteToDo = async (toDoId) => {
    await deleteDoc(doc(db, "todos", toDoId));
    let updatedToDos = [...toDos].filter((item) => item.id != toDoId);
    setToDos(updatedToDos);
  };

  let renderToDoItem = ({item}) => {
    return (
      <View style={[AppStyles.rowContainer, AppStyles.rightMargin, AppStyles.leftMargin]}>
        <View style={AppStyles.fillSpace}>
          <BouncyCheckbox
            isChecked={item.complated}
            size={25}
            fillColor="#258ea6"
            unfillColor="#FFFFFF"
            text={item.text}
            iconStyle={{ borderColor: "#258ea6" }}
            onPress={(isChecked) => { checkToDoItem(item, isChecked)}}
          />
        </View>
        <InlineTextButton text="Delete" color="#258ea6" onPress={() => deleteToDo(item.id)} />
      </View>
    );
  }

  let showContent = () => {
    return (
      <View>
        {isLoading ? <ActivityIndicator size="large" /> : showToDoList() }
        <Button 
          title="Add ToDo" 
          onPress={() => setModalVisible(true)} 
          color="#fb4d3d" />
      </View>
    );
  };

  const showSendVerificationEmail = () => {
    return (
      <View>
        <Text>Please verify your email to use ToDo</Text>
        <Button title="Send Verification Email" onPress={() => sendEmailVerification(auth.currentUser)} />
      </View>
    );
  };

  
  
  return (
    <SafeAreaView>

      <Text style={AppStyles.header}>ToDo</Text>
      {/* {auth.currentUser.emailVerified ? showContent() : showSendVerificationEmail()}*/}
      
    </SafeAreaView>
  )
}
