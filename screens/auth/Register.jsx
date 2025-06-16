import React, { useState, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../../scripts/Authenticator';
import AuthForm from '../../components/AuthForm';
import { ROUTES } from '../../constants/routes';

const RegisterScreen = ({ navigation }) => {
  const [tuitionNumber, setTuitionNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!tuitionNumber || !name || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        tuitionNumber,
        name,
        password,
        role
      });

      if (result.success) {
        // Auto-login após registro bem-sucedido
        const loginResult = await login(tuitionNumber, password);
        
        if (loginResult.success) {
          Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Voce esta logado');
          // Navegação será tratada pelo Authenticator/AppStack
        } else {
          Alert.alert('Aviso', 'Cadastro realizado, porem login automatico falhou. Por favor faça login manualmente.');
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace(ROUTES.LOGIN);
          }
        }
      } else {
        Alert.alert('Erro no Cadastro', result.error || 'Ocorreu um erro durante o cadastro');
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha no cadastro. Tente novamente.');
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
      submitText="Cadastrar"
      toggleText="Já tem uma conta? Faça login"
    />
  );
};

export default RegisterScreen;