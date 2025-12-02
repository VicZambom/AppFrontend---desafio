import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, Alert, ActivityIndicator, Keyboard, StatusBar, SafeAreaView 
} from 'react-native';
import axios from 'axios';

interface Tarefa {
  _id: string;
  titulo: string;
  status: 'Pendente' | 'Concluída';
}

const API_URL = 'http://192.168.1.10:3000/tarefas';

export default function App() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const buscarTarefas = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Tarefa[]>(API_URL);
      setTarefas(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique a URL.");
    } finally {
      setLoading(false);
    }
  };

  const salvarTarefa = async () => {
    if (!titulo.trim()) return Alert.alert("Atenção", "Digite um título!");

    try {
      if (editandoId) {
        await axios.put(`${API_URL}/${editandoId}`, { titulo });
        Alert.alert("Sucesso", "Tarefa editada!");
      } else {
        await axios.post(API_URL, { titulo, status: 'Pendente' });
      }
      
      setTitulo('');
      setEditandoId(null);
      Keyboard.dismiss();
      buscarTarefas();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    }
  };

  const deletarTarefa = (id: string) => {
    Alert.alert("Excluir", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim", onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${id}`);
            buscarTarefas();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível deletar.");
          }
        }}
    ]);
  };

  const alternarStatus = async (item: Tarefa) => {
    const novoStatus = item.status === 'Pendente' ? 'Concluída' : 'Pendente';
    try {
      await axios.put(`${API_URL}/${item._id}`, { status: novoStatus });
      buscarTarefas();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar status.");
    }
  };

  const editarItem = (item: Tarefa) => {
    setTitulo(item.titulo);
    setEditandoId(item._id);
  };

  useEffect(() => { buscarTarefas(); }, []);

  const renderItem = ({ item }: { item: Tarefa }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <TouchableOpacity onPress={() => alternarStatus(item)}>
          <Text style={[styles.titulo, item.status === 'Concluída' && styles.riscado]}>
            {item.titulo}
          </Text>
          <Text style={[
            styles.status, 
            item.status === 'Concluída' ? styles.statusOk : styles.statusPendente
          ]}>
            {item.status}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnIcon} onPress={() => editarItem(item)}>
          <Text style={{fontSize: 18}}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnIcon} onPress={() => deletarTarefa(item._id)}>
          <Text style={{fontSize: 18}}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarefas (TypeScript)</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="O que precisa fazer?"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TouchableOpacity 
          style={[styles.btnAdd, editandoId ? styles.btnUpdate : {}]} 
          onPress={salvarTarefa}
        >
          <Text style={styles.btnAddText}>{editandoId ? "SALVAR" : "+"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { 
    backgroundColor: '#4A90E2', 
    padding: 20, 
    paddingTop: 50, 
    alignItems: 'center' 
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  form: { 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#FFF', 
    elevation: 3,
    marginBottom: 5 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12, 
    marginRight: 10, 
    fontSize: 16 
  },
  btnAdd: { 
    backgroundColor: '#2ECC71', 
    borderRadius: 8, 
    width: 50, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnUpdate: { backgroundColor: '#F39C12' },
  btnAddText: { color: '#FFF', fontWeight: 'bold', fontSize: 24 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    elevation: 2 
  },
  infoContainer: { flex: 1 },
  titulo: { fontSize: 17, color: '#333', fontWeight: '500' },
  riscado: { textDecorationLine: 'line-through', color: '#AAA' },
  status: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  statusPendente: { color: '#E74C3C' },
  statusOk: { color: '#2ECC71' },
  actions: { flexDirection: 'row' },
  btnIcon: { 
    padding: 8, 
    marginLeft: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 50
  },
  empty: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 16 }
});