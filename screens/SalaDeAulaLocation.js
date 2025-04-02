import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import * as Location from 'expo-location';
import { AuthContext } from '../scripts/Authenticator';
import { MaterialIcons } from '@expo/vector-icons';
import { ROUTES } from '../routes';
//import { useNavigation } from '@react-navigation/native';

const ClassroomSetupScreen = ({ navigation }) => {
  const { saveClassroomSettings } = useContext(AuthContext);
  //const navigation = useNavigation();
  const [radius, setRadius] = useState('50');
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      Alert.alert('Error', 'Falha em capturar a localizacao');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    try {
      await saveClassroomSettings(location, parseInt(radius));
       // Proper navigation reset
       navigation.navigate(ROUTES.MAIN);
      
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="class" 
        size={100} 
        color="#6200ee" 
        style={styles.icon}
      />
      
      <Text style={styles.title}>Salvar Localizacao</Text>
      <Text style={styles.subtitle}>Marque a localizacao atual como sua sala de aula</Text>
      
      <TextInput
        label="Geofence Radius (meters)"
        value={radius}
        onChangeText={setRadius}
        keyboardType="numeric"
        style={styles.input}
        left={<TextInput.Icon name="map-marker-radius" />}
      />
      <Button
        mode="contained"
        onPress={handleSave}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        icon="map-marker-check"
      >
        Salvar Localizacao
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default ClassroomSetupScreen;