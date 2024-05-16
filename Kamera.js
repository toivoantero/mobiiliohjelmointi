import React, { useState, useEffect, useRef } from 'react';
import { Text, Image, Button, View } from 'react-native';
import { Camera } from 'expo-camera';
import { styles } from './styles';

export function Kamera({ navigation }) {
  const [hasCameraPermission, setPermission] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [pulla, setPulla] = useState('kaneli');

  const camera = useRef(null);

  useEffect(() => {
    askCameraPermission();
  }, []);

  const askCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission(status == 'granted');
  };

  const snap = async () => {
    if (camera) {
      const photo = await camera.current.takePictureAsync({ base64: true });
      setPhotoName(photo.uri);
    }
  };

  const testi = () => {
    console.log(photoName);
  };

  return (
    <View style={styles.columncontainer}>
      {hasCameraPermission ?
        (
          <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1, minWidth: "100%" }} ref={camera} />
            <View>
              <Button title="Ota kuva" onPress={snap} />
              <View style={{ height: 30 }} />
              <Button
                title="Hyväksy kuva"
                onPress={() => navigation.navigate("Tietojen syöttö", { polku: photoName })}
              />
            </View>
            <View style={{ flex: 1 }}>
              {photoName
                ? <Image style={{ flex: 1 }} source={{ uri: photoName }} />
                : <Text style={{ flex: 1 }}>File</Text>}
            </View>
          </View>
        ) : (
          <Text>No access to camera</Text>
        )}
    </View>
  );

}
