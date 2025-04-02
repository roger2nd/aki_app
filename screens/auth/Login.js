import React, { useState, useContext } from 'react';
import { View, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { AuthContext } from '../../scripts/Authenticator';
import AuthForm from '../../components/AuthForm';

const LoginScreen = ({ navigation }) => {
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, testAccounts } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!tuitionNumber || !password) {
      Alert.alert('Error', 'Por favor insira o numero de matricula e a senha');
      return;
    }

    setIsLoading(true);
    try {
      // BACKEND API - Credenciais
      const success = await login(tuitionNumber, password);

      if (!success) {
        Alert.alert('Error', 'Credenciais Invalida');
      }
    } catch (error) {
      Alert.alert('Login Falhou', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTestAccount = (account) => {
    setTuitionNumber(account.tuitionNumber);
    setPassword(account.password);
  };

  return (
    <View style={styles.container}>
      <AuthForm
        tuitionNumber={tuitionNumber}
        setTuitionNumber={setTuitionNumber}
        password={password}
        setPassword={setPassword}
        isLogin={true}
        onSubmit={handleLogin}
        navigation={navigation}
        isLoading={isLoading}
        title="Bem Vindo de volta"
        submitText="Login"
        icon="login"
      />
        <View style={styles.testAccountsContainer}>
          <Text style={styles.testAccountsTitle}>Contas de Teste:</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => loginWithTestAccount(testAccounts.admin)}
            style={styles.testAccountButton}
            icon="account-tie"
          >
            Login como Admin
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => loginWithTestAccount(testAccounts.student)}
            style={styles.testAccountButton}
            icon="account"
          >
            Login como Aluno
          </Button>
        </View>
    </View>   
  );
};

//TEST
const styles = {
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#6200ee',
  },
  testAccountsContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  testAccountsTitle: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  testAccountButton: {
    marginVertical: 5,
  },
};

export default LoginScreen;