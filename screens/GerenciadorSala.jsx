import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, TextInput, Button, Text, List, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';

const ManageClassStudents = ({ route, navigation }) => {
    const { classId } = route.params;
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [tuitionNumber, setTuitionNumber] = useState('');
    const [studentName, setStudentName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        loadStudents();
    }, [classId]);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            const classData = await ClassService.getClass(classId);
            if (!classData) {
                throw new Error('Turma não encontrada');
            }
            setStudents(classData.students || []);
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            Alert.alert(
                'Erro', 
                'Falha ao carregar alunos: ' + (error.message || 'Erro desconhecido'),
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.matricula.includes(searchQuery)
    );

    const addStudent = async () => {
        if (!tuitionNumber || !studentName) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setIsLoading(true);
        try {
            const newStudent = {
                id: Date.now().toString(),
                matricula: tuitionNumber,
                name: studentName,
                createdAt: new Date().toISOString()
            };

            const updatedClass = await ClassService.addStudentToClass(classId, newStudent);
            if (!updatedClass) {
                throw new Error('Falha ao atualizar turma');
            }

            setStudents(updatedClass.students || []);
            setTuitionNumber('');
            setStudentName('');
            setIsAdding(false);
            Alert.alert('Sucesso', 'Aluno adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar aluno:', error);
            Alert.alert(
                'Erro', 
                'Falha ao adicionar aluno: ' + (error.message || 'Erro desconhecido')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const deleteStudent = async (studentId) => {
        Alert.alert(
            'Confirmar Remoção',
            'Tem certeza que deseja remover este aluno?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Remover', 
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const updatedClass = await ClassService.removeStudentFromClass(classId, studentId);
                            if (!updatedClass) {
                                throw new Error('Falha ao atualizar turma');
                            }
                            setStudents(updatedClass.students || []);
                        } catch (error) {
                            console.error('Erro ao remover aluno:', error);
                            Alert.alert(
                                'Erro', 
                                'Falha ao remover aluno: ' + (error.message || 'Erro desconhecido')
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#6200ee" />
                </View>
            )}

            <Searchbar
                placeholder="Buscar alunos..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.search}
            />

            {isAdding ? (
                <Card style={styles.addCard}>
                    <Card.Content>
                        <TextInput
                            label="Número de Matrícula"
                            value={tuitionNumber}
                            onChangeText={setTuitionNumber}
                            style={styles.input}
                            keyboardType="numeric"
                            disabled={isLoading}
                        />
                        <TextInput
                            label="Nome do Aluno"
                            value={studentName}
                            onChangeText={setStudentName}
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <View style={styles.buttonRow}>
                            <Button 
                                mode="contained" 
                                onPress={addStudent}
                                style={styles.smallButton}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Salvar
                            </Button>
                            <Button 
                                mode="outlined" 
                                onPress={() => setIsAdding(false)}
                                style={styles.smallButton}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            ) : (
                <Button 
                    mode="contained" 
                    onPress={() => setIsAdding(true)}
                    style={styles.button}
                    icon="account-plus"
                    disabled={isLoading}
                >
                    Adicionar Aluno
                </Button>
            )}

            <ScrollView style={styles.listContainer}>
                {filteredStudents.map(student => (
                    <List.Item
                        key={student.id}
                        title={`${student.name} (${student.matricula || student.tuitionNumber})`}
                        description={`Adicionado em: ${new Date(student.createdAt).toLocaleDateString()}`}
                        left={() => (
                            <MaterialIcons 
                                name="person" 
                                size={24} 
                                color="#6200ee" 
                                style={styles.studentIcon}
                            />
                        )}
                        right={() => (
                            <Button 
                                icon="delete"
                                onPress={() => deleteStudent(student.id)}
                                textColor="#ff4444"
                                disabled={isLoading}
                            >
                                Remover
                            </Button>
                        )}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    search: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    addCard: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    button: {
        marginBottom: 16,
    },
    smallButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    listContainer: {
        flex: 1,
    },
    studentIcon: {
        alignSelf: 'center',
        marginRight: 10,
    },
});

export default ManageClassStudents;