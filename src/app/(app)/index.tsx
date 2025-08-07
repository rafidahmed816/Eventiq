import { Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Index() {
  const { profile } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to Eventiq!</Text>
      {profile && (
        <Text style={{ marginTop: 10 }}>
          You are logged in as: {profile.role}
        </Text>
      )}
    </View>
  );
}
