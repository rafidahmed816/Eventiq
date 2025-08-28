// src/components/RoleButton.tsx
import { Button } from "react-native";
import {CONSTANTS} from "../constants/constants";
interface RoleButtonProps {
  role: string;
  selected: boolean;
  onPress: (role: string) => void;
}

export const RoleButton = ({ role, selected, onPress }: RoleButtonProps) => {
  return (
    <Button
      title={role}
      color={selected ? CONSTANTS.PRIMARY_COLOR : "#ccc"}
      onPress={() => onPress(role)}
    />
  );
};
