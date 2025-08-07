// src/components/RoleButton.tsx
import { Button } from "react-native";

interface RoleButtonProps {
  role: string;
  selected: boolean;
  onPress: (role: string) => void;
}

export const RoleButton = ({ role, selected, onPress }: RoleButtonProps) => {
  return (
    <Button
      title={role}
      color={selected ? "#007aff" : "#ccc"}
      onPress={() => onPress(role)}
    />
  );
};
