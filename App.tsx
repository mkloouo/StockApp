import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {uuid} from 'uuidv4';

const SYMBOLS = [
  'APPL',
  'MSFT',
  'INTC',
  'CMCSA',
  'CSCO',
  'EBAY',
  'SIRI',
  'FLEX',
  'AMZN',
  'FCEL',
  'SBUX',
  'HBAN',
  'GILD',
  'MRVL',
  'PLUG',
  'AMAT',
  'CBLI',
  'QCOM',
  'NVDA',
  'BBBY',
];

type Stock = {
  name: string;
  value: number;
};

async function* generateItems(count: number) {
  const getRandomSymbol = () =>
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  for (let i = 0; i < count; ++i) {
    const symbol = getRandomSymbol();
    const stockItem: Stock = await (await fetch(
      'localhost:3030/api/v1/prices?company=' + symbol,
      {
        method: 'GET',
      },
    )).json();

    yield {
      id: uuid(),
      name: symbol,
      value: stockItem.value,
    };
  }
}

type DataItem = {
  id: string;
  name: string;
  value: number;
};

const DATA: DataItem[] = [];

(async () => {
  for await (const item of generateItems(10)) {
    DATA.push(item);
  }
})();

type ItemParams = {
  id: string;
  name: string;
  value: number;
  selected: boolean;
  onSelect: (id: any) => void;
};

function Item({id, name, value, selected, onSelect}: ItemParams) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      style={[
        styles.item,
        {backgroundColor: selected ? '#6e3b6e' : '#f9c2ff'},
      ]}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.value}>{value.toFixed(2)}</Text>
    </TouchableOpacity>
  );
}

const App = () => {
  const [selected, setSelected] = React.useState(new Map());

  const onSelect = React.useCallback(
    id => {
      const newSelected = new Map(selected);
      newSelected.set(id, !selected.get(id));

      setSelected(newSelected);
    },
    [selected],
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={DATA}
          renderItem={({item}) => (
            <Item
              id={item.id}
              name={item.name}
              value={item.value}
              selected={!!selected.get(item.id)}
              onSelect={onSelect}
            />
          )}
          keyExtractor={item => item.id}
          extraData={selected}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  name: {
    flexDirection: 'row',
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  value: {
    flexDirection: 'row',
    color: 'white',
    fontSize: 32,
  },
});

export default App;
