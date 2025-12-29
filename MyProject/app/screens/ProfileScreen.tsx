import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={[styles.textTitle]}>Personal information</Text>
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
export default ProfileScreen;
