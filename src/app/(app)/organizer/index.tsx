import { Text, View } from "react-native";

export default function OrganizerScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Organizer Home</Text>
      <Text style={{ marginTop: 10 }}>This is the organizer dashboard.</Text>
    </View>
  );
} 