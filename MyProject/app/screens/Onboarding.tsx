import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  View,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ONBOARDING_KEY = "@onboarding_completed";
export const USER_FIRST_NAME_KEY = "@user_first_name";
export const USER_EMAIL_KEY = "@user_email";

// Email validation regex
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Onboarding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  // Check if form is valid
  const isFormValid = name.trim().length > 0 && isValidEmail(email.trim());

  const handleComplete = async () => {
    if (!isFormValid) {
      return;
    }

    try {
      // Save onboarding completion status
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      // Save user first name and email
      await AsyncStorage.setItem(USER_FIRST_NAME_KEY, name.trim());
      await AsyncStorage.setItem(USER_EMAIL_KEY, email.trim());
      // Navigate to Profile screen
      navigation.navigate("Profile" as never);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      Alert.alert(
        "Error",
        "Failed to save onboarding status. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginHorizontal: 30 }}>
        <Text style={[styles.textTitle, { marginTop: 40, marginBottom: 100 }]}>
          Let us get to know you
        </Text>
        <Text style={[styles.textTitle, { marginBottom: 20 }]}>First Name</Text>
        <TextInput
          style={[styles.input]}
          placeholder="Enter your name"
          placeholderTextColor={"gray"}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <Text style={[styles.textTitle, { marginBottom: 20 }]}>Email</Text>
        <TextInput
          style={[styles.input]}
          placeholder="Enter your email"
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={{ alignItems: "flex-end", marginRight: 30 }}>
        <Pressable
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={!isFormValid}
        >
          <Text
            style={[
              styles.buttonText,
              !isFormValid && styles.buttonTextDisabled,
            ]}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    width: "100%",
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: "left",
    marginBottom: 40,
  },
  textTitle: {
    color: "#000",
    fontSize: 24,
    fontWeight: 800,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#000",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: "#888",
  },
});
