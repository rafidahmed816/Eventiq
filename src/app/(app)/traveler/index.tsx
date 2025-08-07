import { Text, View } from "react-native";

export default function TravelerScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Feed</Text>
      <Text style={{ marginTop: 10 }}>Welcome to your feed!</Text>
    </View>
  );
}
