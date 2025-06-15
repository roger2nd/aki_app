import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button, Text, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../scripts/Authenticator';
import { HeaderButton } from '../components/HeaderButton';

const ManageStudentsScreen = ({navigation}) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const { logout } = useContext(AuthContext);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton 
          iconName="logout" 
          onPress={logout} 
        />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const savedStudents = await AsyncStorage.getItem(`students_${user.tuitionNumber}`);
      if (savedStudents) setStudents(JSON.parse(savedStudents));
    } catch (e) {
      Alert.alert('Error', 'Carregamento Falhou!');
    }
  };

  const saveStudents = async (studentsList) => {
    try {
      await AsyncStorage.setItem(
        `students_${user.tuitionNumber}`,
        JSON.stringify(studentsList)
      );
      setStudents(studentsList);
    } catch (e) {
      Alert.alert('Error', 'Salvamento falhou!');
    }
  };

  const addStudent = () => {
    if (!tuitionNumber || !studentName) {
      Alert.alert('Error', 'Por favor preencha todos os campos');
      return;
    }

    const newStudent = {
      id: Date.now().toString(),
      tuitionNumber,
      name: studentName,
      class: 'Programacao Mobile'
    };

    const updatedStudents = [...students, newStudent];
    saveStudents(updatedStudents);
    setTuitionNumber('');
    setStudentName('');
  };

  const deleteStudent = (id) => {
    Alert.alert(
      'Confirmar Remocao',
      'Voce tem certeza que quer remover esse aluno?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          const updatedStudents = students.filter(student => student.id !== id);
          saveStudents(updatedStudents);
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Alunos</Text>
      
      <TextInput
        label="Numero de Matricula"
        value={tuitionNumber}
        onChangeText={setTuitionNumber}
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon name="numeric" />}
      />
      
      <TextInput
        label="Nome do Aluno"
        value={studentName}
        onChangeText={setStudentName}
        style={styles.input}
        left={<TextInput.Icon name="account" />}
      />
      
      <Button 
        mode="contained" 
        onPress={addStudent}
        style={styles.button}
        icon="account-plus"
      >
        Adicionar Aluno
      </Button>

      <ScrollView style={styles.listContainer}>
        {students.map(student => (
          <List.Item
            key={student.id}
            title={`${student.name} (${student.tuitionNumber})`}
            description={student.class}
            left={() => (
              <MaterialIcons 
                name="person" 
                size={24} 
                color="#6200ee" 
                style={styles.studentIcon}
              />
            )}
            right={() => (
              <Button 
                icon="delete"
                onPress={() => deleteStudent(student.id)}
              >
                Remover
              </Button>
            )}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  studentIcon: {
    alignSelf: 'center',
    marginRight: 10,
  },
});

export default ManageStudentsScreen;