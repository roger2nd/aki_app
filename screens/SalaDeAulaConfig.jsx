import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { Button, TextInput, Text, Card, Title, Divider, List } from 'react-native-paper';
import * as Location from 'expo-location';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';
import { ROUTES } from '../constants/routes';

const ClassroomConfigScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [className, setClassName] = useState('');
  const [radius, setRadius] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    ////////////// DEBUG/////////////
    const testService = async () => {
      try {
        const test = await ClassService.getClasses('test');
        console.log('Service test:', test);
      } catch (error) {
        console.error('Service test failed:', error);
      }
    };
    testService();
  /////////////////////////////////////
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });
    return unsubscribe;
    }, []);

  const loadClasses = async () => {
    try {
      const allClasses = await ClassService.getClasses(user.tuitionNumber);
      setClasses(allClasses);
      if (allClasses.length > 0 && !currentClass) {
        setCurrentClass(allClasses[0]);
        setClassName(allClasses[0].name);
        setRadius(allClasses[0].geofenceRadius?.toString() || '10');
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Erro', 'Falha ao carregar turmas: ' + error.message);
    }
  };

  const handleCreateClass = () => {
    setCurrentClass({
      id: Date.now().toString(),
      name: '',
      teacherId: user.tuitionNumber,
      geofenceRadius: 10,
      location: null,
      students: [],
      createdAt: new Date().toISOString()
    });
    setClassName('');
    setRadius('10');
  };

  const handleSaveClass = async () => {
  if (!className) {
    Alert.alert('Erro', 'Informe o nome da turma');
    return;
  }

  setIsLoading(true);
    try {
      const classData = {
        ...currentClass,
        name: className,
        geofenceRadius: parseInt(radius) || 10
      };
      
      const savedClass = await ClassService.saveClass(classData);
      console.log('Saved class:', savedClass); // Debug log
      
      // Update local state with the saved class
      setCurrentClass(savedClass);
      await loadClasses();
      Alert.alert('Sucesso', 'Turma salva com sucesso!');
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Erro', 'Falha ao salvar turma: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita acesso à localização');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const updatedClass = {
        ...currentClass,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      };
      setCurrentClass(updatedClass);
      Alert.alert('Sucesso', 'Localização definida!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao obter localização');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAddStudent = () => {
    if (!currentClass?.id) {
      Alert.alert('Erro', 'Selecione uma turma primeiro');
      return;
    }
    navigation.navigate(ROUTES.ADICIONAR_ALUNO, { classId: currentClass.id });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Gerenciar Turmas</Title>

          {/* Class List */}
          <FlatList
            data={classes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.students?.length || 0} alunos`}
                left={() => <List.Icon icon="account-group" />}
                right={() => (
                  <Button 
                    mode="text"
                    onPress={() => {
                      setCurrentClass(item);
                      setClassName(item.name);
                      setRadius(item.geofenceRadius.toString());
                    }}
                  >
                    Selecionar
                  </Button>
                )}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma turma criada</Text>
            }
            scrollEnabled={false}
          />

          <Button
            mode="outlined"
            onPress={handleCreateClass}
            style={styles.button}
            icon="plus"
          >
            Nova Turma
          </Button>

          {/* Class Editor */}
          {currentClass && (
            <>
              <Divider style={styles.divider} />
              <Title style={styles.subtitle}>
                {classes.some(c => c.id === currentClass.id) ? 'Editar Turma' : 'Nova Turma'}
              </Title>

              <TextInput
                label="Nome da Turma"
                value={className}
                onChangeText={setClassName}
                style={styles.input}
              />

              <TextInput
                label="Raio (metros)"
                value={radius}
                onChangeText={setRadius}
                keyboardType="numeric"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleSetLocation}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                icon="map-marker"
              >
                {currentClass.location ? 'Atualizar Localização' : 'Definir Localização'}
              </Button>

              {currentClass.location && (
                <>
                  <Text style={styles.coordinates}>
                    Lat: {currentClass.location.latitude.toFixed(6)}
                    {'\n'}
                    Long: {currentClass.location.longitude.toFixed(6)}
                  </Text>

                  <Button
                    mode="outlined"
                    onPress={() => setShowQRCode(!showQRCode)}
                    style={styles.button}
                    icon="qrcode"
                  >
                    {showQRCode ? 'Ocultar QR' : 'Mostrar QR'}
                  </Button>

                  {showQRCode && (
                    <View style={styles.qrContainer}>
                      <QRCode
                        value={JSON.stringify({
                          classId: currentClass.id,
                          location: currentClass.location,
                          radius: currentClass.geofenceRadius
                        })}
                        size={200}
                        color="#6200ee"  // Set QR code color to match app theme
                        backgroundColor="white"  // Set background to white for better contrast
                      />
                    </View>
                  )}
                </>
              )}

              <Button
                mode="contained"
                onPress={handleSaveClass}
                loading={isLoading}
                disabled={isLoading}
                style={styles.saveButton}
                icon="content-save"
              >
                Salvar Turma
              </Button>

              <Button
                mode="contained"
                onPress={navigateToAddStudent}
                disabled={!currentClass?.id}
                style={styles.button}
                icon="account-plus"
              >
                Adicionar Aluno
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 8,
  },
  saveButton: {
    marginVertical: 16,
  },
  coordinates: {
    marginVertical: 8,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  divider: {
    marginVertical: 16,
  },
});

export default ClassroomConfigScreen;