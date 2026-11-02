import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your deployed backend HTTPS URL. Never put an API key here.
const API_URL = "https://REPLACE-WITH-YOUR-BACKEND-URL";
const STORAGE_KEY = "project_tuesday_messages_v1";

export default function App() {
  const [messages, setMessages] = useState([{ id: "welcome", role: "assistant", content: "Hello. I'm Tuesday. What are we working on?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved && active) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages, ready]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage = { id: String(Date.now()), role: "user", content: text };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    if (API_URL.includes("REPLACE-WITH-YOUR-BACKEND-URL")) {
      setMessages([...updated, { id: String(Date.now() + 1), role: "assistant", content: "The interface is ready, but the backend URL has not been configured. Follow the README setup instructions." }]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.filter(m => m.id !== "welcome").slice(-20).map(({ role, content }) => ({ role, content })), webSearch })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The server returned an error.");
      setMessages(current => [...current, { id: String(Date.now() + 2), role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages(current => [...current, { id: String(Date.now() + 3), role: "assistant", content: `I couldn't reach my backend. ${error.message}` }]);
    } finally { setLoading(false); }
  }

  function clearConversation() {
    setMessages([{ id: "welcome", role: "assistant", content: "Conversation cleared. What shall we work on?" }]);
  }

  function renderMessage({ item }) {
    const user = item.role === "user";
    return <View style={[styles.messageRow, user ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, user ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>;
  }

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="light-content" backgroundColor="#090D18" />
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <View><Text style={styles.title}>TUESDAY</Text><Text style={styles.subtitle}>Your assistant. Your project.</Text></View>
        <TouchableOpacity onPress={clearConversation} style={styles.clearButton}><Text style={styles.clearText}>New chat</Text></TouchableOpacity>
      </View>
      <View style={styles.searchRow}><Text style={styles.searchLabel}>Allow web search</Text><Switch value={webSearch} onValueChange={setWebSearch} trackColor={{ false: "#343B4D", true: "#536DFF" }} thumbColor="#FFFFFF" /></View>
      {!ready ? <ActivityIndicator color="#9BAAFF" style={{ flex: 1 }} /> : <FlatList style={styles.list} contentContainerStyle={styles.listContent} data={messages} keyExtractor={item => item.id} renderItem={renderMessage} />}
      {loading && <View style={styles.loadingRow}><ActivityIndicator color="#9BAAFF" /><Text style={styles.loadingText}>Tuesday is thinking...</Text></View>}
      <View style={styles.composer}>
        <TextInput value={input} onChangeText={setInput} placeholder="Message Tuesday..." placeholderTextColor="#8790A5" style={styles.input} multiline maxLength={8000} />
        <TouchableOpacity onPress={sendMessage} disabled={loading || !input.trim()} style={[styles.sendButton, (loading || !input.trim()) && styles.disabledButton]}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
      <Text style={styles.footer}>Early prototype · AI responses may be inaccurate</Text>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#090D18" }, container: { flex: 1, backgroundColor: "#090D18" },
  header: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#20283A" },
  title: { color: "#FFFFFF", fontSize: 23, fontWeight: "800", letterSpacing: 3 }, subtitle: { color: "#98A3BA", fontSize: 12, marginTop: 3 },
  clearButton: { borderColor: "#39445D", borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }, clearText: { color: "#D7DEEF", fontSize: 12 },
  searchRow: { paddingHorizontal: 18, paddingVertical: 7, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }, searchLabel: { color: "#AEB8CC", fontSize: 12 },
  list: { flex: 1 }, listContent: { padding: 14, paddingBottom: 22 }, messageRow: { width: "100%", marginVertical: 5, flexDirection: "row" }, userRow: { justifyContent: "flex-end" }, assistantRow: { justifyContent: "flex-start" },
  bubble: { maxWidth: "88%", padding: 12, borderRadius: 17 }, userBubble: { backgroundColor: "#465DCE", borderBottomRightRadius: 5 }, assistantBubble: { backgroundColor: "#182236", borderWidth: 1, borderColor: "#27344D", borderBottomLeftRadius: 5 }, messageText: { color: "#F4F6FC", fontSize: 15, lineHeight: 22 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 18, paddingVertical: 8 }, loadingText: { color: "#AEB8CC", fontSize: 12 },
  composer: { flexDirection: "row", alignItems: "flex-end", padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: "#20283A" },
  input: { flex: 1, maxHeight: 120, minHeight: 45, backgroundColor: "#182236", borderColor: "#303C55", borderWidth: 1, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11, color: "#FFFFFF", fontSize: 15 },
  sendButton: { backgroundColor: "#536DFF", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 15 }, disabledButton: { opacity: 0.45 }, sendText: { color: "#FFFFFF", fontWeight: "700" },
  footer: { color: "#68748D", fontSize: 10, textAlign: "center", paddingBottom: 6 }
});
