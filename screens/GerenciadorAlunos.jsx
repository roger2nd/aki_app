import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, List, Text, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';

const ManageStudentsScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const classId = route.params?.classId;
  const className = route.params?.className;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStudents();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      let allStudents = [];
      
      if (classId) {
        const students = await ClassService.getStudentsByClass(classId);
        allStudents = students.map(s => ({ ...s, className }));
      } else {
        const classes = await ClassService.getClasses(user.tuitionNumber);
        allStudents = classes.flatMap(c => 
          (c.students || []).map(s => ({ ...s, className: c.name }))
        );
      }
      
      setStudents(allStudents);
    } catch (error) {
      console.error('Failed to load students:', error);
      Alert.alert('Erro', 'Falha ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      Alert.alert(
        'Confirmar',
        'Tem certeza que deseja remover este aluno?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Remover',
            onPress: async () => {
              setIsLoading(true);
              try {
                if (classId) {
                  // Remove da classe especificada
                  const classData = await ClassService.getClass(classId);
                  const updatedStudents = classData.students.filter(s => s.id !== studentId);
                  await ClassService.saveClass({
                    ...classData,
                    students: updatedStudents
                  });
                } else {
                  // Remove de todas as classes
                  const classes = await ClassService.getClasses(user.tuitionNumber);
                  for (const cls of classes) {
                    if (cls.students?.some(s => s.id === studentId)) {
                      const updatedStudents = cls.students.filter(s => s.id !== studentId);
                      await ClassService.saveClass({
                        ...cls,
                        students: updatedStudents
                      });
                    }
                  }
                }
                
                await loadStudents();
                Alert.alert('Sucesso', 'Aluno removido com sucesso');
              } catch (error) {
                console.error('Error removing student:', error);
                Alert.alert('Erro', 'Falha ao remover aluno');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error showing alert:', error);
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.matricula || '').includes(searchQuery) ||
    (student.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const placeHolderText = className ? "Buscar por nome ou matrícula..." : "Buscar por nome, matrícula ou turma...";

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeHolderText}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {isLoading ? (
        <ActivityIndicator animating={true} color="#6200ee" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={`${item.matricula} - ${item.className || 'Sem Turma'}`}
              left={() => (
                <MaterialIcons 
                  name="person" 
                  size={24} 
                  color="#6200ee" 
                  style={styles.icon}
                />
              )}
              right={() => (
                <Button 
                  mode="text" 
                  onPress={() => handleRemoveStudent(item.id)}
                  textColor="#ff0000"
                  icon="delete-outline"
                >
                  Remover
                </Button>
              )}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum aluno registrado'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  search: {
    marginBottom: 16,
  },
  icon: {
    alignSelf: 'center',
    marginRight: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ManageStudentsScreen;