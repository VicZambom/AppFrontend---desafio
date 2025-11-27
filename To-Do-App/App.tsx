import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc'; // Importamos o Tailwind

// 1. Definição do Tipo (TypeScript)
interface Tarefa {
  id: number;
  titulo: string;
  concluida: number; // O SQLite retorna 0 ou 1
}

export default function App() {
  // Tipando o estado como um array de Tarefa
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // --- CONFIGURAÇÃO DO IP ---
  const API_URL = 'http://192.168.0.141:3000/tarefas'; 

  // Buscar tarefas
  const buscarTarefas = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setTarefas(json.data);
    } catch (error) {
      console.error("Erro:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar tarefa
  const adicionarTarefa = async () => {
    if (!novaTarefa.trim()) return;

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: novaTarefa }),
      });
      setNovaTarefa('');
      buscarTarefas();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar tarefa.");
    }
  };

  useEffect(() => {
    buscarTarefas();
  }, []);

  // Renderização de cada item da lista
  const renderItem = ({ item }: { item: Tarefa }) => (
    <View style={tw`bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 flex-row justify-between items-center`}>
      <Text style={tw`text-lg text-gray-800`}>{item.titulo}</Text>
      <View style={tw`bg-blue-100 px-2 py-1 rounded`}>
        <Text style={tw`text-xs text-blue-600 font-bold`}>ID: {item.id}</Text>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 pt-12 px-5`}>
      <Text style={tw`text-3xl font-bold text-gray-900 mb-6 text-center`}>
        Minhas Tarefas
      </Text>

      {/* Input e Botão */}
      <View style={tw`flex-row mb-6`}>
        <TextInput
          style={tw`flex-1 bg-white border border-gray-300 rounded-l-lg p-3 text-lg`}
          placeholder="O que precisa ser feito?"
          value={novaTarefa}
          onChangeText={setNovaTarefa}
        />
        <TouchableOpacity 
          style={tw`bg-blue-600 justify-center px-6 rounded-r-lg active:bg-blue-700`}
          onPress={adicionarTarefa}
        >
          <Text style={tw`text-white font-bold text-lg`}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={tw`pb-10`}
          ListEmptyComponent={
            <Text style={tw`text-center text-gray-400 mt-10`}>
              Nenhuma tarefa encontrada.
            </Text>
          }
        />
      )}
    </View>
  );
}