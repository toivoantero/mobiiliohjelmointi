import React, { useState } from 'react';
import { Text, View, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { styles } from './styles';

export function Saa() {

  const [saa, setSaa] = useState([]);
  const [pituusaste, setPituusaste] = useState('');
  const [leveysaste, setLeveysaste] = useState('');
  const [apikey, setApikey] = useState('2e7d05bea49b32e64dcfa27199bf69cf');

  const haeSaa = () => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${leveysaste}&lon=${pituusaste}&appid=${apikey}`)
      .then(response => response.json())
      .then(data => setSaa(data))
      .catch(error => {
        Alert.alert('Error'
          , error.message);
      });
  }

  const muotoileAjankohta = (dt) => {
    const aika = new Date(dt * 1000);
    const klo = aika.toLocaleString("fi-FI", { hour: '2-digit', minute: '2-digit' });
    const pvm = aika.toLocaleDateString("fi-FI");
    return { pvm, klo };
  }

  const SaaItem = ({ item }) => {
    const { pvm, klo } = muotoileAjankohta(item.dt);
    return (
      <View>
        <View style={styles.rowcontainer}>
          <Text style={{ color: "lightblue", fontSize: 20, marginHorizontal: 10 }}>{pvm}</Text>
          <Text style={{ color: "thistle", fontSize: 20, marginHorizontal: 10 }}>klo {klo}</Text>
        </View>
        <View style={styles.textcontainer}>
          <Text style={styles.text}>Lämpötila: {item.main.temp} K</Text>
          <Text style={styles.text}>Tuntuu kuin: {item.main.feels_like} K</Text>
          <Text style={styles.text}>Kosteus: {item.main.humidity} %</Text>
          <Text style={styles.text}>Pilvisyys: {item.clouds.all} %</Text>
          <Text style={styles.text}>Tuuli: {item.wind.speed} m/s, suunta: {item.wind.deg}°</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.background}>
      <View style={styles.columncontainer}>
        <View style={styles.rowcontainer}>
          <View style={{ flex:1, flexDirection: 'column' }}>
            <Text style={styles.label}>pituusaste</Text>
            <TextInput
              style={styles.inputfield}
              placeholder='esim. 60.14'
              placeholderTextColor={'darkgray'}
              keyboardType="numeric"
              onChangeText={pituusaste => setPituusaste(pituusaste)}
              value={pituusaste} />
          </View>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text style={styles.label}>leveysaste</Text>
            <TextInput
              style={styles.inputfield}
              placeholder='esim. 24.94'
              placeholderTextColor={'darkgray'}
              keyboardType="numeric"
              onChangeText={leveysaste => setLeveysaste(leveysaste)}
              value={leveysaste} />
          </View>
        </View>
        <Pressable style={[styles.button, { backgroundColor: 'rgb(120,150,190)' }]}
          onPress={haeSaa}>
          <Text style={styles.buttonText}>Hae viiden päivän sääennuste</Text>
        </Pressable>
        <FlatList
          style={{ width: '100%' }}
          data={saa.list}
          renderItem={({ item }) => <SaaItem item={item} />}
          keyExtractor={item => item.dt.toString()}
        />
      </View>
    </View>
  );
}
