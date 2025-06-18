import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import { HeaderButton } from '../components/HeaderButton';
import { DatePickerModal } from 'react-native-paper-dates';
import registerDatePickerTranslations from '../utils/datePickerTranslation';
import { ROUTES } from '../constants/routes';
import ClassService from '../services/ClassService';

registerDatePickerTranslations();

const ViewAttendanceScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [filterDate, setFilterDate] = useState(null);

    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton 
            iconName="logout" 
            onPress={logout} 
          />
        ),
      });
    }, [navigation]);

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        loadAttendance();
      });
      return unsubscribe;
    }, []);

    const loadAttendance = async () => {
      setIsLoading(true);
      try {
        const records = await ClassService.getAttendanceRecords(user.tuitionNumber);
        setAttendanceRecords(records);
      } catch (error) {
        console.error('Failed to load attendance', error);
        Alert.alert('Erro', 'Falha ao carregar histórico de presença');
      } finally {
        setIsLoading(false);
      }
    };

    const deleteAttendanceRecord = async (date, classId) => {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o registro de presença de ${date}?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await ClassService.deleteAttendanceRecord(user.tuitionNumber, date, classId);
                const updatedRecords = await ClassService.getAttendanceRecords(user.tuitionNumber);
                setAttendanceRecords(updatedRecords);
                Alert.alert('Sucesso', 'Registro excluído com sucesso');
              } catch (error) {
                console.error('Failed to delete record', error);
                Alert.alert('Erro', 'Falha ao excluir registro');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    };

    const getFilteredRecords = () => {
      if (!filterDate) return attendanceRecords;
      
      const formattedDate = filterDate.toISOString().split('T')[0];
      return attendanceRecords.filter(r => r.date === formattedDate)
               .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const onDismissDatePicker = () => {
      setOpenDatePicker(false);
    };

    const onConfirmDatePicker = ({ date }) => {
      setOpenDatePicker(false);
      setFilterDate(date);
    };

    const clearDateFilter = () => {
      setFilterDate(null);
    };

    return (
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <Button 
            mode="outlined" 
            onPress={() => setOpenDatePicker(true)}
            icon="calendar"
            style={styles.dateButton}
          >
            {filterDate ? filterDate.toLocaleDateString('pt-BR') : 'Filtrar por data'}
          </Button>
          {filterDate && (
            <Button 
              mode="text" 
              onPress={clearDateFilter}
              icon="close"
            >
              Limpar
            </Button>
          )}
        </View>

        <DatePickerModal
          locale="pt-BR"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismissDatePicker}
          date={filterDate}
          onConfirm={onConfirmDatePicker}
          label="Selecionar data"
          saveLabel="Confirmar"
        />

        {isLoading ? (
          <ActivityIndicator animating={true} style={styles.loader} />
        ) : (
          <ScrollView style={styles.listContainer}>
            {getFilteredRecords().length > 0 ? (
              getFilteredRecords().map(record => (
                <Card 
                  key={`${record.date}_${record.classId}`}
                  style={styles.card}
                >
                  <Card.Content>
                    <Text style={styles.cardTitle}>
                      <MaterialCommunityIcons name="calendar-today" size={18} /> {record.date}
                    </Text>
                    <Text style={styles.className}>{record.className}</Text>
                    <View style={styles.statsContainer}>
                      <Text style={styles.present}>
                        <MaterialCommunityIcons name="check" size={16} color="green" /> 
                        {record.records.filter(r => r.present).length} Presentes
                      </Text>
                      <Text style={styles.absent}>
                        <MaterialCommunityIcons name="close" size={16} color="red" /> 
                        {record.records.filter(r => !r.present).length} Faltantes
                      </Text>
                    </View>
                  </Card.Content>
                  <Card.Actions style={styles.cardActions}>
                    <Button 
                      mode="contained"
                      onPress={() => navigation.navigate(ROUTES.CHECAR_PRESENCA, { 
                        classId: record.classId,
                        date: record.date 
                      })}
                      icon="eye"
                      style={styles.actionButton}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      mode="outlined"
                      onPress={() => deleteAttendanceRecord(record.date, record.classId)}
                      icon="delete"
                      style={styles.actionButton}
                      textColor="#d32f2f"
                    >
                      Excluir
                    </Button>
                  </Card.Actions>
                </Card>
              ))
            ) : (
              <Text style={styles.emptyText}>
                {filterDate ? 'Nenhum registro encontrado para esta data' : 'Nenhum registro de presença'}
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    marginRight: 8,
  },
  loader: {
    marginVertical: 20,
  },
  listContainer: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  className: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  present: {
    color: 'green',
  },
  absent: {
    color: 'red',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ViewAttendanceScreen;