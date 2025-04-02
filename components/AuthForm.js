import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const AuthForm = ({ 
  tuitionNumber, 
  setTuitionNumber, 
  password, 
  setPassword, 
  name,
  setName,
  isLogin, 
  onSubmit, 
  navigation,
  isLoading 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        label="Tuition Number"
        value={tuitionNumber}
        onChangeText={setTuitionNumber}
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon name="numeric" />}
      />
      {!isLogin && (
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          left={<TextInput.Icon name="account" />}
        />
      )}
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        left={<TextInput.Icon name="lock" />}
      />
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
      >
        {isLogin ? 'Login' : 'Register'}
      </Button>
      <Button
        onPress={() => navigation.navigate(isLogin ? 'Register' : 'Login')}
        style={styles.toggleButton}
      >
        {isLogin 
          ? 'Need an account? Register' 
          : 'Already have an account? Login'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  toggleButton: {
    marginTop: 15,
  },
});

export default AuthForm;