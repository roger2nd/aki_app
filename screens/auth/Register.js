import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../../scripts/Authenticator';
import AuthForm from '../../components/AuthForm';
import { MaterialIcons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!tuitionNumber || !name || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would register with your backend
      const userData = {
        tuitionNumber,
        name,
        role: "teacher"
      };
      await login(userData);
      Alert.alert('Success', 'Registration successful');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="person-add" 
        size={100} 
        color="#6200ee" 
        style={styles.icon}
      />
      <AuthForm
        tuitionNumber={tuitionNumber}
        setTuitionNumber={setTuitionNumber}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        isLogin={false}
        onSubmit={handleRegister}
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

export default RegisterScreen;