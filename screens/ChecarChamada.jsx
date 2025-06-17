import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { List, Checkbox, Text, FAB, Searchbar, Button, Snackbar } from 'react-native-paper';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';
import { DatePickerModal } from 'react-native-paper-dates';
import registerDatePickerTranslations from '../utils/datePickerTranslation';
import QRCode from 'react-native-qrcode-svg';
import { getCurrentLocation, generateAttendanceQRCodeData } from '../services/GeoLocationQRCodeService';
import { exportToCSV } from '../utils/csvExport';

registerDatePickerTranslations();

const TakeAttendanceScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [location, setLocation] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current date in UTC-3 (Brazil)
  const getCurrentBrasilDate = () => {
    const now = new Date();
    now.setHours(now.getHours() - 3); // UTC-3 adjustment
    return now;
  };

  const [today] = useState(() => {
    const today = getCurrentBrasilDate();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [date, setDate] = useState(getCurrentBrasilDate());

  const isToday = () => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        loadClasses();
      });
      return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass, date]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const classesData = await ClassService.getClasses(user.tuitionNumber);
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id);
      }
    } catch (e) {
      console.error('Failed to load classes', e);
      showSnackbar('Falha ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const classData = await ClassService.getClass(selectedClass);
      const studentsList = classData.students || [];
      
      const formattedDate = date.toISOString().split('T')[0];
      const attendanceRecords = await ClassService.getAttendanceRecords(user.tuitionNumber);
      
      let attendanceData = {};
      
      // Find records for this specific class and date
      const dateRecords = attendanceRecords.find(r => 
        r.date === formattedDate && r.classId === selectedClass
      );
      
      if (dateRecords) {
        dateRecords.records.forEach(record => {
          attendanceData[record.studentId] = record.present;
        });
      }
      
      // Initialize attendance for today's date
      if (isToday()) {
        studentsList.forEach(student => {
          if (attendanceData[student.id] === undefined) {
            attendanceData[student.id] = false;
          }
        });
      }
      
      setStudents(studentsList);
      setAttendance(attendanceData);
    } catch (e) {
      console.error('Failed to load students', e);
      showSnackbar('Falha ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    /* if (!isToday()) return; */
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const saveAttendance = async () => {
    try {
      setIsLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      
      const attendanceRecord = {
        date: formattedDate,
        classId: selectedClass,
        className: classes.find(c => c.id === selectedClass)?.name,
        teacherTuition: user.tuitionNumber,
        records: students.map(student => ({
          studentId: student.id,
          studentTuition: student.tuitionNumber,
          studentName: student.name,
          present: attendance[student.id] || false
        }))
      };
      
      await ClassService.saveAttendanceRecord(attendanceRecord);
      showSnackbar('Presença salva com sucesso');
    } catch (e) {
      console.error('Error saving attendance', e);
      showSnackbar('Falha ao salvar presença');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttendance = async () => {
    try {
      setIsLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const className = classes.find(c => c.id === selectedClass)?.name;
      
      const csvData = students.map(student => ({
        Matrícula: student.tuitionNumber,
        Nome: student.name,
        Presença: attendance[student.id] ? 'Presente' : 'Faltou',
        Data: formattedDate,
        Turma: className
      }));

      const filename = `presenca_${className}_${formattedDate}.csv`.replace(/ /g, '_');
      await exportToCSV(csvData, filename);
      showSnackbar('Dados exportados com sucesso');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Falha ao exportar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      setLocation(location);
      
      const qrData = generateAttendanceQRCodeData(
        selectedClass,
        user.tuitionNumber,
        location
      );
      
      setQrCodeValue(qrData);
      setQrCodeVisible(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      showSnackbar('Falha ao obter localização');
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onDismissSingle = () => {
    setOpenDatePicker(false);
  };

  const onConfirmSingle = (params) => {
    setOpenDatePicker(false);
    setDate(params.date);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.matricula || '').includes(searchQuery)
  );
  
  if (isLoading && !menuVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Button 
          mode="outlined" 
          onPress={() => setOpenDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
        >
          {formatDate(date)}
        </Button>
        
        <DatePickerModal
          locale="pt-BR"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
          label="Selecione a data"
          saveLabel="Confirmar"
          validRange={{
            endDate: today
          }}
        />

        <Searchbar
          placeholder="Buscar aluno..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />
      </View>

      <View style={styles.classSelector}>
        {classes.map(cls => (
          <Button
            key={cls.id}
            mode={selectedClass === cls.id ? "contained" : "outlined"}
            onPress={() => setSelectedClass(cls.id)}
            style={styles.classButton}
          >
            {cls.name}
          </Button>
        ))}
      </View>

      <Text style={styles.title}>
        {selectedClass ? classes.find(c => c.id === selectedClass)?.name : 'Selecione uma turma'} - {formatDate(date)}
      </Text>
      
      <ScrollView style={styles.listContainer}>
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <List.Item
              key={student.id}
              title={`${student.name} (${student.tuitionNumber || student.matricula})`} // TODO: Workaround. Em algum ponto do codigo foi trocado tuitionNumber por matricula 
              left={() => (
                <Checkbox
                  status={attendance[student.id] ? 'checked' : 'unchecked'}
                  onPress={() => toggleAttendance(student.id)}
                  /* disabled={!isToday()} */
                />
              )}
              right={() => (
                <Text style={attendance[student.id] ? styles.present : styles.absent}>
                  {attendance[student.id] ? 'Presente' : 'Faltou'}
                </Text>
              )}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum aluno encontrado' : 'Nenhum aluno registrado'}
          </Text>
        )}
      </ScrollView>

      {qrCodeVisible && (
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCodeContent}>
            <Text style={styles.qrCodeTitle}>QR Code de Presença</Text>
            <QRCode
              value={qrCodeValue}
              size={200}
              color="#6200ee" 
              backgroundColor="white"
            />
            {location && (
              <Text style={styles.locationText}>
                Localização: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
            <Button 
              mode="contained" 
              onPress={() => setQrCodeVisible(false)}
              style={styles.closeButton}
            >
              Fechar
            </Button>
          </View>
        </View>
      )}

      <FAB.Group
        open={menuVisible}
        visible={!!selectedClass}
        icon={menuVisible ? 'close' : isLoading ? 'loading' : 'plus'}
        actions={[
          {
            icon: 'checkbox-multiple-marked',
            label: 'Todos AKI',
            onPress: () => {
              const newAttendance = {};
              students.forEach(student => {
                newAttendance[student.id] = true;
              });
              setAttendance(newAttendance);
              showSnackbar('Todos marcados como presentes');
            },
          },
          isToday() && {
            icon: 'qrcode',
            label: 'AKI QR Code',
            onPress: generateQRCode,
          },
          {
            icon: 'content-save',
            label: 'Salvar Presença',
            onPress: saveAttendance,
          },
          {
            icon: 'download',
            label: 'Exportar CSV',
            onPress: exportAttendance,
          },
          isToday() && {
            icon: 'refresh',
            label: 'Recarregar',
            onPress: loadStudents,
          },
        ].filter(Boolean)}
        onStateChange={({ open }) => setMenuVisible(open)}
        fabStyle={styles.fab}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    marginRight: 8,
  },
  search: {
    flex: 1,
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  classButton: {
    margin: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  present: {
    color: 'green',
    alignSelf: 'center',
  },
  absent: {
    color: 'red',
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  qrCodeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  qrCodeContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default TakeAttendanceScreen;