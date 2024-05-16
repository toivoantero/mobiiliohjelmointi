import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabase('pelivalikko.db');

db.transaction(tx => {
  tx.executeSql('CREATE TABLE IF NOT EXISTS tyotehtava (id INTEGER PRIMARY KEY NOT NULL, nimike TEXT, kuukausipalkka INTEGER);');
  tx.executeSql('DELETE FROM tyotehtava;');
  tx.executeSql('INSERT INTO tyotehtava (nimike, kuukausipalkka) VALUES ("Kokki", 2100);');
  tx.executeSql('INSERT INTO tyotehtava (nimike, kuukausipalkka) VALUES ("Suunnistaja", 3000);');
  tx.executeSql('INSERT INTO tyotehtava (nimike, kuukausipalkka) VALUES ("Kartoittaja", 2500);');
  tx.executeSql('INSERT INTO tyotehtava (nimike, kuukausipalkka) VALUES ("Rekiajuri", 2200);');
  tx.executeSql('CREATE TABLE IF NOT EXISTS retkeilija (id INTEGER PRIMARY KEY NOT NULL, nimi TEXT, tyotehtavaid INTEGER, puhelinnumero TEXT, osoite TEXT, kuva TEXT, FOREIGN KEY (tyotehtavaid) REFERENCES tyotehtava(id));');
}, () => console.error("Virhe tietokantataulujen luomisessa"));
