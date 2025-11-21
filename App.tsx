import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  return <AppNavigator />;
}