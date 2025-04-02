import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../routes';

const AuthForm = ({
  tuitionNumber,
  setTuitionNumber,
  name,
  setName,
  password,
  setPassword,
  role,
  setRole,
  isLogin,
  onSubmit,
  navigation,
  isLoading,
  title,
  submitText,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={isLogin ? icon : "account-plus"} 
        size={80} 
        color="#6200ee" 
        style={styles.icon}
      />
           
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Tuition Number Field */}
      <TextInput
        label="Numero de Matricula"
        value={tuitionNumber}
        onChangeText={setTuitionNumber}
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon name="numeric" />}
        autoCapitalize="none"
      />

      {/* Name Field (only for registration) */}
      {!isLogin && (
        <TextInput
          label="Nome e Sobrenome"
          value={name}
          onChangeText={setName}
          style={styles.input}
          left={<TextInput.Icon name="account" />}
        />
      )}

      {/* Password Field */}
      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        left={<TextInput.Icon name="lock" />}
      />

      {/* Role Selection (only for registration) */}
      {!isLogin && (
        <>
          <Text style={styles.sectionTitle}>Register as:</Text>
          <RadioButton.Group onValueChange={setRole} value={role}>
            <View style={styles.radioOption}>
              <RadioButton value="student" />
              <Text>Aluno</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="admin" />
              <Text>Admin</Text>
            </View>
          </RadioButton.Group>
        </>
      )}

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
      >
        {submitText || (isLogin ? 'Login' : 'Register')}
      </Button>

      {/* Toggle between Login/Register */}
      <Button
        onPress={() => navigation.navigate(isLogin ? ROUTES.REGISTER : ROUTES.LOGIN)}
        style={styles.toggleButton}
        labelStyle={styles.toggleButtonText}
      >
        {isLogin 
          ? 'Nao tem conta? Registre-se' 
          : 'Ja tem uma conta? Login'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#6200ee',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    color: '#666',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 8,
  },
  buttonContent: {
    height: 48,
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleButtonText: {
    color: '#6200ee',
  },
});

export default AuthForm;