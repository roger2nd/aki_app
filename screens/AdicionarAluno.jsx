import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Card, Title, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../scripts/Authenticator';
import ClassService from '../services/ClassService';
import { ROUTES } from '../constants/routes';

const AddStudentScreen = ({ navigation, route }) => {
    const { classId } = route.params;
    const [name, setName] = useState('');
    const [matricula, setMatricula] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    const handleAddStudent = async () => {
        if (!name || !matricula) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setIsLoading(true);
        try {
            const updatedClass = await ClassService.addStudentToClass(classId, {
                id: Date.now().toString(),
                name,
                matricula,
                createdAt: new Date().toISOString()
            });

            if (updatedClass) {
                Alert.alert('Sucesso', 'Aluno adicionado com sucesso!');
                const className = await ClassService.getClassName(classId);
                navigation.navigate(ROUTES.GERENCIADOR_ALUNOS, { 
                    classId,
                    className,
                    refresh: Date.now() 
                });
            }
        } catch (error) {
            console.error('Error adding student:', error);
            Alert.alert(
                'Erro', 
                error.message === 'Turma não encontrada' 
                    ? 'Turma não encontrada' 
                    : 'Falha ao adicionar aluno'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Adicionar Aluno</Title>
                    
                    <TextInput
                        label="Nome do Aluno"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                    
                    <TextInput
                        label="Número de Matrícula"
                        value={matricula}
                        onChangeText={setMatricula}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    
                    <Button
                        mode="contained"
                        onPress={handleAddStudent}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                    >
                        Adicionar
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={toggleQRCode}
                        style={styles.button}
                        icon="qrcode"
                    >
                        {showQRCode ? 'Ocultar' : 'Adicionar via QR Code'}
                    </Button>

                    {showQRCode && (
                        <View style={styles.qrContainer}>
                            {/* <Text style={styles.qrTitle}>Adicionar Alunos</Text> */}
                            <QRCode
                                value={JSON.stringify({
                                    classId: classId,
                                    type: 'addStudent'
                                })}
                                size={200}
                                color="#6200ee"
                                backgroundColor="white"
                            />
                            <Text style={styles.qrInstructions}>
                                Escaneie este QR code com um login do tipo aluno para ser adicionado a esta turma.
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 8,
    },
    qrContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    qrInstructions: {
        marginTop: 10,
        textAlign: 'center',
        color: '#666',
    },
});

export default AddStudentScreen;