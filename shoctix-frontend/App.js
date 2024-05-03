import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const App = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const requestAudioPermissions = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== "granted") {
          console.error("Permission to record audio was denied");
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
      } catch (error) {
        console.error("Error requesting audio permissions:", error);
      }
    };

    requestAudioPermissions();
  }, []);

  const uploadRecording = async (recordingURI) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: recordingURI,
        name: 'recording.m4a',
        type: 'audio/m4a',
      });

      await axios.post('http://192.168.1.35:3000/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Recording uploaded successfully');

      // Eliminar el archivo local después de la subida al servidor
      await FileSystem.deleteAsync(recordingURI);

      console.log('Recording deleted from local storage');
    } catch (error) {
      console.error("Error uploading recording:", error);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Verificar si la grabación está en curso
        if (recording) {
          console.log("Stopping recording...");
          setIsRecording(false); // Actualizar el estado de grabación
          await recording.stopAndUnloadAsync();
          console.log("Recording stopped.");
          uploadRecording(recording.getURI());
          setRecording(null);
        } else {
          console.warn("Recording is not started yet.");
        }
      } else {
        // Iniciar la grabación
        console.log("Starting recording...");
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          console.error("Permission to record audio was denied");
          return;
        }

        const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true); // Actualizar el estado de grabación
        // Iniciar la grabación
        console.log("Recording started.");
        await recording.startAsync();
      }
    } catch (error) {
      console.error("Error toggling recording:", error);
      // Manejar el error y evitar que afecte el funcionamiento de la aplicación
      console.warn("Recording error encountered, but continuing...");
    }
  };

  return (
    <ImageBackground source={require('./assets/splash.png')} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={toggleRecording}>
          <Text style={styles.buttonText}>{isRecording ? 'DETENER' : 'PERIFONEAR'}</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>{isRecording ? 'BOCINA ENCENDIDA' : 'BOCINA APAGADA'}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 40,
  },
});

export default App;
