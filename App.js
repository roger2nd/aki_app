import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './scripts/Authenticator';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { AuthContext } from './scripts/Authenticator';
import { View, ActivityIndicator } from 'react-native';


const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const RootNavigator = () => {
  const { user, isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return user ? <AppStack /> : <AuthStack />;
};

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

export default App;
