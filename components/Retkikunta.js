import React, { useState, useEffect } from 'react';
import { Text, TextInput, Image, View, Alert, FlatList, Pressable } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { showMessage } from "react-native-flash-message";
import { db } from '../luoTietokanta';
import { styles } from '../styles/styles';

export function Retkikunta() {

  const [retkeilijat, setRetkeilijat] = useState([]);
  const [muokattavatTiedot, setMuokattavatTiedot] = useState({});
  const [tyotehtavat, setTyotehtavat] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('select * from tyotehtava;', [], (_, { rows }) => setTyotehtavat(rows._array)
      );
    }, null, null);
  }, []);

  const paivitaRetkeilijat = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT retkeilija.*, tyotehtava.nimike AS tyotehtava FROM retkeilija LEFT JOIN tyotehtava ON retkeilija.tyotehtavaid = tyotehtava.id;', [], (_, { rows }) => setRetkeilijat(rows._array)
      );
    }, null, null);
  };

  const muutaTietoja = (text, id, kentta) => {
    setMuokattavatTiedot(prevState => ({
      ...prevState,
      [id]: { ...prevState[id], [kentta]: text }
    }));
  };

  const tallennaMuutokset = (id) => {
    if (muokattavatTiedot[id]) {
      const { puhelinnumero, osoite, tyotehtavaid } = muokattavatTiedot[id];
      const alkuperaisetTiedot = retkeilijat.find(item => item.id === id);

      db.transaction(tx => {
        tx.executeSql(
          'UPDATE retkeilija SET puhelinnumero = ?, osoite = ?, tyotehtavaid = ? WHERE id = ?;',
          [
            puhelinnumero !== undefined ? puhelinnumero : alkuperaisetTiedot.puhelinnumero,
            osoite !== undefined ? osoite : alkuperaisetTiedot.osoite,
            tyotehtavaid !== undefined ? tyotehtavaid : alkuperaisetTiedot.tyotehtavaid,
            id
          ]
        );
      }, null, paivitaRetkeilijat);
      showMessage({
        message: "Retkeilijän tiedot on muutettu!",
        type: "info",
      });
    } else {
      showMessage({
        message: "Muuta vähintään yksi tieto ennen tallennusta!",
        type: "warning",
      });
    }
  };

  const poistaRetkeilija = (id) => {
    Alert.alert(null, 'Oletko varma, että retkeilijä irtisanotaan?', [
      {
        text: 'Peru',
        style: 'cancel',
      },
      {
        text: 'Kyllä', onPress: () => db.transaction(
          tx => tx.executeSql('delete from retkeilija where id = ?;', [id]), null, paivitaRetkeilijat)
      },
    ]);
  };

  useEffect(() => { paivitaRetkeilijat(); }, [retkeilijat]);

  return (
    <View style={styles.background}>
      <FlatList
        style={{ width: '100%' }}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <View style={{
          flexDirection: 'column',
          backgroundColor: 'lightgray',
          borderBottomWidth: 3,
          alignItems: 'center'
        }}>
          <Text style={styles.title}>{item.nimi}</Text>
          <View style={styles.rowcontainer}>
            <View style={{ backgroundColor: 'darkgray', flex: 3 }}>
              <Text style={styles.label}>Työtehtävä</Text>
              <SelectList
                setSelected={(val) => muutaTietoja(val, item.id, 'tyotehtavaid')}
                data={tyotehtavat.map(tehtava => ({ key: tehtava.id, value: tehtava.nimike }))}
                save="key"
                search={false}
                maxHeight={130}
                placeholder={tyotehtavat[item.tyotehtavaid - 1].nimike}
                boxStyles={styles.selectlistBox}
                inputStyles={styles.selectlistInput}
                dropdownStyles={styles.selectlistDropdown} />
              <Text style={styles.label}>Puhelinnumero</Text>
              <TextInput
                style={styles.inputfield}
                placeholder="Uusi puhelinnumero"
                keyboardType="numeric"
                onChangeText={(text) => muutaTietoja(text, item.id, 'puhelinnumero')}
                value={muokattavatTiedot[item.id] && muokattavatTiedot[item.id].puhelinnumero !== undefined
                  ? muokattavatTiedot[item.id].puhelinnumero
                  : item.puhelinnumero} />
              <Text style={styles.label}>Osoite</Text>
              <TextInput
                style={styles.inputfield}
                placeholder="Uusi osoite"
                onChangeText={(text) => muutaTietoja(text, item.id, 'osoite')}
                value={muokattavatTiedot[item.id] && muokattavatTiedot[item.id].osoite !== undefined
                  ? muokattavatTiedot[item.id].osoite
                  : item.osoite} />
              <Pressable
                onPress={() => tallennaMuutokset(item.id)}
                style={[styles.button, { backgroundColor: 'rgb(120,150,190)', height: 110 }]}>
                <Text style={styles.buttonText}>Tallenna muutokset</Text>
              </Pressable>
            </View>
            <View style={{ flex: 2 }}>
              <View>
                {item.kuva ? (
                  <Image
                    style={{ height: 310, width: 150 }}
                    source={{ uri: item.kuva }} />
                ) : (
                  <Text style={{ height: 310, width: 150, textAlign: 'center' }}>Ei kuvaa</Text>
                )}
              </View>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'gray',
            marginHorizontal: 10
          }}>
            <View style={{ flex: 3, height: 220, backgroundColor: 'darkgray' }}></View>
            <View style={{ flex: 2 }}>
              <Pressable
                onPress={() => poistaRetkeilija(item.id)}
                style={[styles.button, { backgroundColor: 'rgb(100,100,100)' }]}>
                <Text style={styles.buttonText}>IRTISANO</Text>
              </Pressable>
            </View>
          </View>
        </View>}
        data={retkeilijat} />
    </View>
  );
}
