import {Picker} from '@react-native-picker/picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {IPlayer} from '../../interface/IPlayer';
import {createPlayerSubscription} from '../../services/firebase';
import PlayerCard from '../PlayerCard/playerCard';

type StackParamList = {
  Players: undefined;
  Details: IPlayer;
};
type NavigationPropType = NativeStackNavigationProp<StackParamList, 'Details'>;

interface Props {
  navigation: NavigationPropType;
}

interface State {
  players: IPlayer[];
  filteredPlayers: IPlayer[];
  search: string;
  position: string;
  isLoading: boolean;
}

export default class PlayersScreen extends React.Component<Props, State> {
  unsubscribe: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      players: [],
      filteredPlayers: [],
      search: '',
      position: 'all',
      isLoading: true,
    };
    this.unsubscribe = () => {};
  }

  componentDidMount() {
    this.unsubscribe = createPlayerSubscription(data => {
      this.setState({players: data, isLoading: false}, () => {
        this.filterPlayers();
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  removeAccents = (text: string) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  filterPlayers = () => {
    const {players, search, position} = this.state;
    const filteredPlayers = players.filter(player => {
      const matchesSearch =
        this.removeAccents(player.name?.toLowerCase() || '').includes(
          this.removeAccents(search.toLowerCase()),
        ) ||
        this.removeAccents(player.surname?.toLowerCase() || '').includes(
          this.removeAccents(search.toLowerCase()),
        );
      const matchesPosition =
        position === 'all' ||
        player.position?.toLowerCase() === position.toLowerCase();
      return matchesSearch && matchesPosition;
    });
    this.setState({filteredPlayers});
  };

  handleSearchChange = (search: string) => {
    this.setState({search}, this.filterPlayers);
  };

  handlePositionChange = (position: string) => {
    this.setState({position}, this.filterPlayers);
  };

  renderItem = ({item}: {item: IPlayer}) => (
    <Pressable onPress={() => this.props.navigation.navigate('Details', item)}>
      <PlayerCard {...item} />
    </Pressable>
  );

  render() {
    const {filteredPlayers, search, position, isLoading} = this.state;

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Cargando jugadores...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o apellido"
            value={search}
            onChangeText={this.handleSearchChange}
          />
          <Picker
            selectedValue={position}
            style={styles.picker}
            onValueChange={this.handlePositionChange}>
            <Picker.Item label="Todas las posiciones" value="all" />
            <Picker.Item label="Base" value="Base" />
            <Picker.Item label="Escolta" value="Escolta" />
            <Picker.Item label="Alero" value="Alero" />
            <Picker.Item label="Ala-Pívot" value="Ala-Pívot" />
            <Picker.Item label="Pívot" value="Pívot" />
          </Picker>
        </View>

        <FlatList
          style={styles.flatList}
          data={filteredPlayers}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  filtersContainer: {
    marginBottom: 16, // Espaciado entre filtros y la lista
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8, // Espaciado entre el TextInput y el Picker
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
  },
  flatList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
});
