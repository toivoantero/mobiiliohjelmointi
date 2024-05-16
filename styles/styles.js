import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  },
  textcontainer: {
    margin: 10,
  },
  text: {
    fontSize: 17
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 22,
    color: "white",
    textAlign: 'center'
  },
  inputfield: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 22,
    marginBottom: 23,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    height: 55,
  },
  label: {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 15, 
    margin: 0, 
    alignItems: 'flex-end'
  },
  selectlistBox: {
    backgroundColor: 'white',
    borderRadius: 0,
    borderColor: 'black',
    marginBottom: 23,
    height: 55,
    alignItems: 'flex-start'
  },
  selectlistInput: {
    fontSize: 22, color: 'black'
  },
  selectlistDropdown: {
    backgroundColor: 'rgb(235,235,235)',
    marginTop: -23
  }
});
