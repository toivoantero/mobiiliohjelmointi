import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, Image, Button, View, Alert, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SelectList } from 'react-native-dropdown-select-list'
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import * as Contacts from 'expo-contacts';

const Tab = createBottomTabNavigator();
const db = SQLite.openDatabase('pelivalikko.db');

db.transaction(tx => {
  tx.executeSql('DROP TABLE IF EXISTS omatvarusteet;');
  tx.executeSql('CREATE TABLE IF NOT EXISTS omatvarusteet (id INTEGER PRIMARY KEY NOT NULL, nimi TEXT, hinta INTEGER, tyyppi TEXT, kuva TEXT);');
  tx.executeSql('DELETE FROM omatvarusteet;');
  tx.executeSql('INSERT INTO omatvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Taskulamppu", 10, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM omatvarusteet WHERE nimi = "Taskulamppu");');
  tx.executeSql('DROP TABLE IF EXISTS kaupanvarusteet;');
  tx.executeSql('CREATE TABLE IF NOT EXISTS kaupanvarusteet (id INTEGER PRIMARY KEY NOT NULL, nimi TEXT, hinta INTEGER, tyyppi TEXT, kuva TEXT);');
  tx.executeSql('DELETE FROM kaupanvarusteet;');
  tx.executeSql('INSERT INTO kaupanvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Tulitikut", 5, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM kaupanvarusteet WHERE nimi = "Tulitikut");');
  tx.executeSql('INSERT INTO kaupanvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Naskalit", 3, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM kaupanvarusteet WHERE nimi = "Naskalit");');
  tx.executeSql('INSERT INTO kaupanvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Pilkkionki", 15, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM kaupanvarusteet WHERE nimi = "Pilkkionki");');
  tx.executeSql('INSERT INTO kaupanvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Turkishattu", 25, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM kaupanvarusteet WHERE nimi = "Turkishattu");');
  tx.executeSql('INSERT INTO kaupanvarusteet (nimi, hinta, tyyppi, kuva) SELECT "Lyhty", 20, "tarvike", null WHERE NOT EXISTS (SELECT 1 FROM kaupanvarusteet WHERE nimi = "Lyhty");');
}, () => console.error("Error when creating DB"));

function Varvaa() {

  const [nimi, setNimi] = useState('');
  const [tyotehtava, setTyotehtava] = useState('');
  const [yhteystieto, setYhteystieto] = useState({});

  useEffect(() => {
    db.transaction(tx => {
      // Alla oleva lause on vain kehitysympäristöä varten, julkaisussa tauluja ei haluta poistaa jokaisessa sovelluksen käynnistyksessä.
      tx.executeSql('DROP TABLE IF EXISTS retkeilija;');
      tx.executeSql('create table if not exists retkeilija (id integer primary key not null, nimi text, tyotehtava text, varuste text, kuva text, voimavarat integer);');
    }, () => console.error("Error when creating DB"), null);
  }, []);

  const tallennaRetkeilija = () => {
    if (tyotehtava != '' && nimi != '') {
      db.transaction(tx => {
        tx.executeSql('insert into retkeilija (nimi, tyotehtava, varuste, kuva, voimavarat) values (?, ?, "miekka", "tiedustelija_n.png", "30");',
          [nimi, tyotehtava]);
      }, null, null)
      showMessage({
        message: "Retkeilijä värvätty retkikuntaan!",
        type: "info",
      });
      setTyotehtava('');
      setNimi('');
    } else {
      showMessage({
        message: "Värvättävällä on oltava nimi ja työtehtävä!",
        type: "info",
      });
    }
  }

  const getYhteystiedot = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers]
      })

      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setYhteystieto(data[randomIndex]);
      }
    }
  }

  const satunnainenNimi = () => {
    getYhteystiedot();
    setNimi(yhteystieto.name);
  }

  return (
    <View style={styles.background}>
      <View style={styles.columncontainer}>
        <View style={{ width: '70%' }}>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>Tällä lomakkeella voit värvätä{"\n"}uusia jäseniä retkikuntaan.</Text>
          <Text style={{ color: 'dodgerblue', fontSize: 18, textAlign: 'center' }} onPress={satunnainenNimi}>Satunnainen nimi</Text>
          <TextInput
            style={{ fontSize: 22, marginTop: 35, padding: 10, borderWidth: 1 }}
            placeholder='Nimi'
            onChangeText={nimi => setNimi(nimi)}
            value={nimi} />
          <TextInput
            style={{ fontSize: 22, marginVertical: 35, padding: 10, borderWidth: 1 }}
            placeholder='Työtehtävä'
            onChangeText={tyotehtava => setTyotehtava(tyotehtava)}
            value={tyotehtava} />
          <Button onPress={tallennaRetkeilija} title="Värvää" />
        </View>
      </View>
    </View>
  );
}

function Varustus() {

  const [retkeilijat, setRetkeilijat] = useState([]);
  const [varusteet, setVarusteet] = useState([]);
  const [valitutRuuat, setValitutRuuat] = useState({});

  const fooddata = varusteet
    .filter(item => item.tyyppi === "ruoka")
    .map(item => ({
      key: item.id,
      value: item.nimi,
      image: item.kuva
    }));

  const varusteetdata = varusteet
    .filter(item => item.tyyppi === "tarvike")
    .map(item => ({
      key: item.id,
      value: item.nimi,
      image: item.kuva
    }));

  const paivitaRetkeilijat = () => {
    db.transaction(tx => {
      tx.executeSql('select * from retkeilija;', [], (_, { rows }) =>
        setRetkeilijat(rows._array)
      );
    }, null, null);
  }

  const paivitaVarusteet = () => {
    db.transaction(tx => {
      tx.executeSql('select * from omatvarusteet;', [], (_, { rows }) =>
        setVarusteet(rows._array)
      );
    }, null, null);
  }

  const poistaRetkeilija = (id) => {
    Alert.alert(null, 'Oletko varma, että retkeilijä irtisanotaan?', [
      {
        text: 'Peru',
        style: 'cancel',
      },
      {
        text: 'Kyllä', onPress: () =>
          db.transaction(
            tx => tx.executeSql('delete from retkeilija where id = ?;', [id]), null, paivitaRetkeilijat)
      },
    ]);
  }

  const poistaRuoka = (ruokaid, retkeilijaid) => {
    db.transaction(tx =>
      tx.executeSql('delete from omatvarusteet where id = ?;', [ruokaid]), null, paivitaVarusteet)
    db.transaction(tx =>
      tx.executeSql('UPDATE retkeilija SET voimavarat = CASE WHEN voimavarat + 10 > 100 THEN 100 ELSE voimavarat + 10 END WHERE id = ?;',
        [retkeilijaid]), null, paivitaRetkeilijat)
  }

  const tallennaVaruste = (varustenimi, retkeilijaid) => {
    db.transaction(tx =>
      tx.executeSql('UPDATE retkeilija SET varuste = ? WHERE id = ?',
        [varustenimi, retkeilijaid]), null, paivitaRetkeilijat)
    console.log("Retkeilijän (id:" + retkeilijaid + ") varuste on vaihdattu tähän: " + varustenimi)
  }

  useEffect(() => { paivitaRetkeilijat() }, [retkeilijat]);
  useEffect(() => { paivitaVarusteet() }, [varusteet]);

  return (
    <View style={styles.background}>
      <FlatList
        style={{ width: '100%' }}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
          <View style={{
            flexDirection: 'column',
            backgroundColor: 'lightgray',
            borderBottomWidth: 3,
            alignItems: 'center'
          }}>
            <Text style={styles.title}>{item.nimi}</Text>
            <Text style={styles.subtitle}>{item.tyotehtava}</Text>
            <View style={styles.rowcontainer}>
              <View style={{ backgroundColor: 'darkgray', flex: 3 }}>
                <Text style={{ fontSize: 18, textAlign: 'center' }}>Voimavarat</Text>
                <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'dodgerblue', textAlign: 'center', marginBottom: 20 }}>{Math.floor(item.voimavarat)}/100</Text>
                <Button title='Syö ruoka' onPress={() => poistaRuoka(valitutRuuat[item.id], item.id)}></Button>
                <SelectList
                  setSelected={(key) => setValitutRuuat({ ...valitutRuuat, [item.id]: key })}
                  data={fooddata}
                  save="key"
                  search={false}
                  maxHeight={130}
                  placeholder='Ruoka'
                  boxStyles={{ marginTop: 30, backgroundColor: 'white' }}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Image
                  style={{ height: 310, width: 150 }}
                  source={require('./kuvat/tiedustelija_n.png')} />
                <Button title='Irtisano' onPress={() => poistaRetkeilija(item.id)}></Button>
              </View>
            </View>
            <View style={{
              flexDirection: 'row',
              backgroundColor: 'gray',
              marginHorizontal: 10
            }}>
              <View style={{ backgroundColor: 'darkgray', flex: 3 }}>
                <SelectList
                  setSelected={(val) => tallennaVaruste(val, item.id)}
                  data={varusteetdata}
                  save="value"
                  search={false}
                  maxHeight={130}
                  placeholder='Tarvike'
                  boxStyles={{ backgroundColor: 'white' }}
                />
              </View>
              <View style={{ flex: 2, height: 300 }}>
              </View>
            </View>
          </View>}
        data={retkeilijat}
      />
    </View>
  );
}

function Kauppa() {

  const [varusteetKauppa, setVarusteetKauppa] = useState([]);
  const [rahat, setRahat] = useState(999);
  const [keyword, setKeyword] = useState('tomato');
  const [foodrepo, setFoodrepo] = useState([]);

  const fooddata = foodrepo.map(item => ({
    id: item.idMeal,
    nimi: item.strMeal,
    hinta: "10",
    tyyppi: "ruoka",
    kuva: item.strMealThumb
  }));

  const getFoodrepo = () => {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${keyword}`)
      .then(response => response.json())
      .then(data => setFoodrepo(data.meals))
      .catch(error => {
        Alert.alert('Error'
          , error);
      });
  }

  const paivitaVarusteetKauppa = () => {
    db.transaction(tx => {
      tx.executeSql('select * from kaupanvarusteet;', [], (_, { rows }) =>
        setVarusteetKauppa(rows._array)
      );
    }, null, null);
  }

  const ostaVaruste = (nimi, hinta, tyyppi, kuva) => {
    db.transaction(tx => {
      tx.executeSql('insert into omatvarusteet (nimi, hinta, tyyppi, kuva) values (?, ?, ?, ?);',
        [nimi, hinta, tyyppi, kuva]);
      setRahat(rahat - hinta);
      showMessage({
        message: nimi + " ostettu!",
        type: "info",
      });
    }, null)
  }

  useEffect(() => { paivitaVarusteetKauppa() }, []);
  useEffect(() => { getFoodrepo() }, []);

  return (
    <View style={styles.background}>
      <Text style={{ marginLeft: 10 }}>Voit ostaa lisää varusteita.{"\n"}Tuote ostetaan koskettamalla sitä.</Text>
      <View style={{ position: 'absolute', top: 0, right: 0 }}>
        <Text style={{ fontSize: 20, color: 'gold', backgroundColor: 'black' }}>{rahat} kultaa</Text>
        <Text>Tässä on{"\n"}käytössäsi{"\n"}olevat varat.</Text>
      </View>
      <View style={{ marginTop: 60, flexDirection: 'row' }}>
        <Text style={{ flex: 1, marginLeft: 10 }}>Tavarat</Text>
        <Text style={{ flex: 1, marginLeft: 10 }}>Ruoat</Text>
      </View>
      <View style={styles.rowcontainer}>
        <FlatList
          style={{ flex: 1 }}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            <View style={styles.columncontainer}>
              <Text style={{ fontSize: 20, marginVertical: 10, textAlign: 'center' }} onPress={() => ostaVaruste(item.nimi, item.hinta, item.tyyppi, item.kuva)}>{item.nimi}</Text>
            </View>}
          data={varusteetKauppa}
        />
        <FlatList
          style={{ flex: 1 }}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            <View style={styles.columncontainer}>
              <Text style={{ fontSize: 20, marginVertical: 10, textAlign: 'center' }} onPress={() => ostaVaruste(item.nimi, item.hinta, item.tyyppi, item.kuva)}>{item.nimi}</Text>
            </View>}
          data={fooddata}
        />
      </View>
    </View>
  );
}

const screenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    let iconName;

    if (route.name === 'Kauppa') {
      iconName = 'ellipse-outline';
    } else if (route.name === 'Varustus') {
      iconName = 'ellipse-outline';
    } else if (route.name === 'Värvää') {
      iconName = 'ellipse-outline';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  }
});

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Värvää" component={Varvaa} />
        <Tab.Screen name="Varustus" component={Varustus} />
        <Tab.Screen name="Kauppa" component={Kauppa} />
      </Tab.Navigator>
      <FlashMessage position="center" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'white',
  },
  rowcontainer: {
    flexDirection: 'row',
    backgroundColor: 'gray',
    marginHorizontal: 10
  },
  columncontainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 10
  },
  subtitle: {
    fontSize: 26,
    marginBottom: 30
  }
});