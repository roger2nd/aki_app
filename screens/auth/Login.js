import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../scripts/Authenticator';
import AuthForm from '../../components/AuthForm';
import { MaterialIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!tuitionNumber || !password) {
      Alert.alert('Error', 'Please enter both tuition number and password');
      return;
    }

    setIsLoading(true);
    try {
      // Checagem na API (firebase)
      const userData = {
        tuitionNumber,
        name: "Demo Teacher",
        role: "teacher" 
      }; // Placeholder para uma possivel resposta da API (firebase)
      await login(userData);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="school" 
        size={100} 
        color="#6200ee" 
        style={styles.icon}
      />
      <AuthForm
        tuitionNumber={tuitionNumber}
        setTuitionNumber={setTuitionNumber}
        password={password}
        setPassword={setPassword}
        isLogin={true}
        onSubmit={handleLogin}
        navigation={navigation}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 30,
  },
});

export default LoginScreen;