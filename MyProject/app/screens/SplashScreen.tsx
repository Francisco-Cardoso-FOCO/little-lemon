import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/Little-Lemon-Images/Logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  logo: {
    width: 250,
    height: 100,
  },
});
