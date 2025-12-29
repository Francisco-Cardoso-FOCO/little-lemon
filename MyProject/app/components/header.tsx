import { StyleSheet, View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_FIRST_NAME_KEY } from "../screens/Onboarding";

const USER_AVATAR_KEY = "@user_avatar";
const USER_LAST_NAME_KEY = "@user_last_name";

export function Header() {
  const navigation = useNavigation();
  const route = useRoute();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Check if we're on the Onboarding screen
  const isOnboardingScreen = route.name === "Onboarding";

  const loadUserData = useCallback(async () => {
    try {
      const savedFirstName = await AsyncStorage.getItem(USER_FIRST_NAME_KEY);
      const savedLastName = await AsyncStorage.getItem(USER_LAST_NAME_KEY);
      const savedAvatar = await AsyncStorage.getItem(USER_AVATAR_KEY);

      if (savedFirstName) {
        setFirstName(savedFirstName);
      } else {
        setFirstName("");
      }
      if (savedLastName) {
        setLastName(savedLastName);
      } else {
        setLastName("");
      }
      if (savedAvatar) {
        setAvatarUri(savedAvatar);
      } else {
        setAvatarUri(null);
      }
    } catch (error) {
      console.error("Error loading user data in header:", error);
    }
  }, []);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  // Periodically refresh when on Profile screen to catch updates
  useEffect(() => {
    if (route.name === "Profile") {
      const interval = setInterval(() => {
        loadUserData();
      }, 1000); // Check every second when on Profile screen

      return () => clearInterval(interval);
    }
  }, [route.name, loadUserData]);

  // Get initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName.trim()
      ? firstName.trim()[0].toUpperCase()
      : "";
    const lastInitial = lastName.trim() ? lastName.trim()[0].toUpperCase() : "";
    return firstInitial + lastInitial || "U";
  };

  return (
    <SafeAreaView style={styles.headerContainer} edges={["top"]}>
      <View style={styles.headerContent}>
        <View style={styles.backButtonPlaceholder} />

        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/Little-Lemon-Images/Logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {!isOnboardingScreen && (
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
          </View>
        )}
        {isOnboardingScreen && <View style={styles.backButtonPlaceholder} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 50,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#495E57",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
