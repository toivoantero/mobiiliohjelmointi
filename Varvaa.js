import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { useRoute } from "@react-navigation/native"
import { showMessage } from "react-native-flash-message";
import { db } from './luoTietokanta';
import { styles } from './styles';

export function Varvaa({ navigation }) {

  const route = useRoute();
  const [kuva, setKuva] = useState(route.params?.polku);
  const [nimi, setNimi] = useState('');
  const [tyotehtava, setTyotehtava] = useState('');
  const [puhelinnumero, setPuhelinnumero] = useState('');
  const [osoite, setOsoite] = useState('');
  const [kaikkiTyotehtavat, setKaikkiTyotehtavat] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('select * from tyotehtava;', [], (_, { rows }) => setKaikkiTyotehtavat(rows._array)
      );
    }, null, null);
  }, []);

  useEffect(() => {
    setKuva(route.params?.polku);
  }, [route.params?.polku]);

  const tallennaRetkeilija = () => {
    if (tyotehtava != '' && nimi != '' && puhelinnumero != '' && osoite != '') {
      db.transaction(tx => {
        tx.executeSql('insert into retkeilija (nimi, tyotehtavaid, puhelinnumero, osoite, kuva) values (?, ?, ?, ?, ?);',
          [nimi, tyotehtava, puhelinnumero, osoite, kuva]);
      }, null, null);
      showMessage({
        message: "Retkeilijä värvätty retkikuntaan!",
        type: "info",
      });
      setNimi('');
      setPuhelinnumero('');
      setOsoite('');
      setKuva('');
    } else {
      showMessage({
        message: "Täydennä kaikki tiedot ennen värväämistä!",
        type: "info",
      });
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.columncontainer}>
        <View style={{ width: '70%' }}>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>Tällä lomakkeella voit värvätä{"\n"}uusia jäseniä retkikuntaan.</Text>
          <Pressable style={[styles.button, { backgroundColor: 'rgb(145,145,145)', marginBottom: 23 }]}
            onPress={() => navigation.navigate('Kamera')}>
            <Text style={styles.buttonText}>Ota profiilikuva</Text>
          </Pressable>
          <TextInput
            style={styles.inputfield}
            placeholder='Nimi'
            placeholderTextColor={'darkgray'}
            onChangeText={nimi => setNimi(nimi)}
            value={nimi} />
          <SelectList
            setSelected={(val) => setTyotehtava(val)}
            data={kaikkiTyotehtavat.map(tehtava => ({ key: tehtava.id, value: tehtava.nimike }))}
            save="key"
            search={false}
            maxHeight={130}
            placeholder='Työtehtävä'
            boxStyles={styles.selectlistBox}
            inputStyles={styles.selectlistInput}
            dropdownStyles={styles.selectlistDropdown} />
          <TextInput
            style={styles.inputfield}
            placeholder='Puhelinnumero'
            placeholderTextColor={'darkgray'}
            keyboardType="numeric"
            onChangeText={puhelinnumero => setPuhelinnumero(puhelinnumero)}
            value={puhelinnumero} />
          <TextInput
            style={styles.inputfield}
            placeholder='Osoite'
            placeholderTextColor={'darkgray'}
            onChangeText={osoite => setOsoite(osoite)}
            value={osoite} />
          <Pressable style={[styles.button, { backgroundColor: 'rgb(120,150,190)' }]}
            onPress={tallennaRetkeilija}>
            <Text style={styles.buttonText}>Värvää</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
