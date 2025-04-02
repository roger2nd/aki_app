import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  card: {
    marginBottom: 10,
    padding: 15,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  present: {
    color: 'green',
  },
  absent: {
    color: 'red',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});