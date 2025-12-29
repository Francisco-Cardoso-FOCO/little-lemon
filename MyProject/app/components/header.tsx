import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

export function Header() {
  return (
    <SafeAreaView style={styles.headerContainer} edges={["top"]}>
      <Image
        source={require("@/assets/Little-Lemon-Images/Logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 100,
  },
});
