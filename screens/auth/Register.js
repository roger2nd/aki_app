import React, { useState, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../../scripts/Authenticator';
import AuthForm from '../../components/AuthForm';
import { ROUTES } from '../../routes';

const RegisterScreen = ({ navigation }) => {
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!tuitionNumber || !name || !password) {
      Alert.alert('Error', 'Por favor complete todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        tuitionNumber,
        name,
        password,
        role,
        registeredAt: new Date().toISOString()
      });

      if (success) {
        Alert.alert('Success', 'Registration successful! Please login');
        navigation.navigate(ROUTES.LOGIN);
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Registro Falhou', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      tuitionNumber={tuitionNumber}
      setTuitionNumber={setTuitionNumber}
      name={name}
      setName={setName}
      password={password}
      setPassword={setPassword}
      role={role}
      setRole={setRole}
      isLogin={false}
      onSubmit={handleRegister}
      navigation={navigation}
      isLoading={isLoading}
      title="Criar Conta"
      submitText="Registrar"
    />
  );
};

export default RegisterScreen;