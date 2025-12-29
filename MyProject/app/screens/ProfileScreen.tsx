import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image as ExpoImage } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";
import {
  USER_FIRST_NAME_KEY,
  USER_EMAIL_KEY,
  ONBOARDING_KEY,
} from "./Onboarding";

const USER_AVATAR_KEY = "@user_avatar";
const USER_LAST_NAME_KEY = "@user_last_name";
const USER_PHONE_KEY = "@user_phone";
const USER_ORDER_STATUSES_KEY = "@user_order_statuses";
const USER_PASSWORD_CHANGES_KEY = "@user_password_changes";
const USER_SPECIAL_OFFERS_KEY = "@user_special_offers";
const USER_NEWSLETTER_KEY = "@user_newsletter";

function ProfileScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("(217) 555-0113");
  const [phoneError, setPhoneError] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [orderStatuses, setOrderStatuses] = useState(true);
  const [passwordChanges, setPasswordChanges] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(true);
  const [newsletter, setNewsletter] = useState(true);

  // Get initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName.trim()
      ? firstName.trim()[0].toUpperCase()
      : "";
    const lastInitial = lastName.trim() ? lastName.trim()[0].toUpperCase() : "";
    return firstInitial + lastInitial || "U";
  };

  // Validate USA phone number (must have 10 digits)
  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      setPhoneError("");
      return true;
    } else if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError("Phone number must have 10 digits");
      return false;
    } else {
      setPhoneError("");
      return false;
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    validatePhoneNumber(text);
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedFirstName = await AsyncStorage.getItem(USER_FIRST_NAME_KEY);
        const savedLastName = await AsyncStorage.getItem(USER_LAST_NAME_KEY);
        const savedEmail = await AsyncStorage.getItem(USER_EMAIL_KEY);
        const savedPhone = await AsyncStorage.getItem(USER_PHONE_KEY);
        const savedAvatar = await AsyncStorage.getItem(USER_AVATAR_KEY);
        const savedOrderStatuses = await AsyncStorage.getItem(
          USER_ORDER_STATUSES_KEY
        );
        const savedPasswordChanges = await AsyncStorage.getItem(
          USER_PASSWORD_CHANGES_KEY
        );
        const savedSpecialOffers = await AsyncStorage.getItem(
          USER_SPECIAL_OFFERS_KEY
        );
        const savedNewsletter = await AsyncStorage.getItem(USER_NEWSLETTER_KEY);

        if (savedFirstName) {
          setFirstName(savedFirstName);
        }
        if (savedLastName) {
          setLastName(savedLastName);
        }
        if (savedEmail) {
          setEmail(savedEmail);
        }
        if (savedPhone) {
          setPhoneNumber(savedPhone);
        }
        if (savedAvatar) {
          setAvatarUri(savedAvatar);
        }
        if (savedOrderStatuses !== null) {
          setOrderStatuses(savedOrderStatuses === "true");
        }
        if (savedPasswordChanges !== null) {
          setPasswordChanges(savedPasswordChanges === "true");
        }
        if (savedSpecialOffers !== null) {
          setSpecialOffers(savedSpecialOffers === "true");
        }
        if (savedNewsletter !== null) {
          setNewsletter(savedNewsletter === "true");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleChangeAvatar = async () => {
    try {
      // Request permission to access media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to change your avatar!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem(USER_AVATAR_KEY, uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image. Please try again.");
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUri(null);
    try {
      await AsyncStorage.removeItem(USER_AVATAR_KEY);
    } catch (error) {
      console.error("Error removing avatar:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all user data from AsyncStorage
      await AsyncStorage.multiRemove([
        ONBOARDING_KEY,
        USER_FIRST_NAME_KEY,
        USER_EMAIL_KEY,
        USER_AVATAR_KEY,
        USER_LAST_NAME_KEY,
        USER_PHONE_KEY,
        USER_ORDER_STATUSES_KEY,
        USER_PASSWORD_CHANGES_KEY,
        USER_SPECIAL_OFFERS_KEY,
        USER_NEWSLETTER_KEY,
      ]);

      // Navigate to Onboarding screen
      navigation.navigate("Onboarding" as never);
    } catch (error) {
      console.error("Error clearing user data:", error);
      // Navigate anyway even if clearing fails
      navigation.navigate("Onboarding" as never);
    }
  };

  const handleDiscardChanges = async () => {
    // Reset to saved values from AsyncStorage
    try {
      const savedFirstName = await AsyncStorage.getItem(USER_FIRST_NAME_KEY);
      const savedLastName = await AsyncStorage.getItem(USER_LAST_NAME_KEY);
      const savedEmail = await AsyncStorage.getItem(USER_EMAIL_KEY);
      const savedPhone = await AsyncStorage.getItem(USER_PHONE_KEY);
      const savedAvatar = await AsyncStorage.getItem(USER_AVATAR_KEY);
      const savedOrderStatuses = await AsyncStorage.getItem(
        USER_ORDER_STATUSES_KEY
      );
      const savedPasswordChanges = await AsyncStorage.getItem(
        USER_PASSWORD_CHANGES_KEY
      );
      const savedSpecialOffers = await AsyncStorage.getItem(
        USER_SPECIAL_OFFERS_KEY
      );
      const savedNewsletter = await AsyncStorage.getItem(USER_NEWSLETTER_KEY);

      if (savedFirstName) {
        setFirstName(savedFirstName);
      } else {
        setFirstName("");
      }
      if (savedLastName) {
        setLastName(savedLastName);
      } else {
        setLastName("Doe");
      }
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        setEmail("");
      }
      if (savedPhone) {
        setPhoneNumber(savedPhone);
      } else {
        setPhoneNumber("(217) 555-0113");
      }
      if (savedAvatar) {
        setAvatarUri(savedAvatar);
      } else {
        setAvatarUri(null);
      }
      if (savedOrderStatuses !== null) {
        setOrderStatuses(savedOrderStatuses === "true");
      } else {
        setOrderStatuses(true);
      }
      if (savedPasswordChanges !== null) {
        setPasswordChanges(savedPasswordChanges === "true");
      } else {
        setPasswordChanges(true);
      }
      if (savedSpecialOffers !== null) {
        setSpecialOffers(savedSpecialOffers === "true");
      } else {
        setSpecialOffers(true);
      }
      if (savedNewsletter !== null) {
        setNewsletter(savedNewsletter === "true");
      } else {
        setNewsletter(true);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Validate phone number before saving
      if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        alert("Please enter a valid phone number before saving.");
        return;
      }

      // Save all profile data to AsyncStorage
      await AsyncStorage.multiSet([
        [USER_FIRST_NAME_KEY, firstName],
        [USER_LAST_NAME_KEY, lastName],
        [USER_EMAIL_KEY, email],
        [USER_PHONE_KEY, phoneNumber],
        [USER_ORDER_STATUSES_KEY, orderStatuses.toString()],
        [USER_PASSWORD_CHANGES_KEY, passwordChanges.toString()],
        [USER_SPECIAL_OFFERS_KEY, specialOffers.toString()],
        [USER_NEWSLETTER_KEY, newsletter.toString()],
      ]);

      // Save avatar if it exists
      if (avatarUri) {
        await AsyncStorage.setItem(USER_AVATAR_KEY, avatarUri);
      } else {
        await AsyncStorage.removeItem(USER_AVATAR_KEY);
      }

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal information</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {avatarUri ? (
            <ExpoImage
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>
          )}
          <View style={styles.avatarButtons}>
            <Pressable style={styles.changeButton} onPress={handleChangeAvatar}>
              <Text style={styles.changeButtonText}>Change</Text>
            </Pressable>
            <Pressable style={styles.removeButton} onPress={handleRemoveAvatar}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone number</Text>
          <MaskedTextInput
            mask="(999) 999-9999"
            style={[styles.input, phoneError ? styles.inputError : null]}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            placeholder="(000) 000-0000"
            keyboardType="phone-pad"
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}
        </View>
      </View>

      {/* Email Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email notifications</Text>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setOrderStatuses(!orderStatuses)}
        >
          <View
            style={[styles.checkbox, orderStatuses && styles.checkboxChecked]}
          >
            {orderStatuses && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Order statuses</Text>
        </Pressable>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setPasswordChanges(!passwordChanges)}
        >
          <View
            style={[styles.checkbox, passwordChanges && styles.checkboxChecked]}
          >
            {passwordChanges && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Password changes</Text>
        </Pressable>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setSpecialOffers(!specialOffers)}
        >
          <View
            style={[styles.checkbox, specialOffers && styles.checkboxChecked]}
          >
            {specialOffers && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Special offers</Text>
        </Pressable>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setNewsletter(!newsletter)}
        >
          <View style={[styles.checkbox, newsletter && styles.checkboxChecked]}>
            {newsletter && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Newsletter</Text>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>

        <View style={styles.bottomButtons}>
          <Pressable
            style={styles.discardButton}
            onPress={handleDiscardChanges}
          >
            <Text style={styles.discardButtonText}>Discard changes</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save changes</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: "#495E57",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
  },
  avatarButtons: {
    flexDirection: "row",
    gap: 10,
  },
  changeButton: {
    backgroundColor: "#495E57",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  changeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  removeButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#495E57",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: "#495E57",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
  },
  actionButtons: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#F4CE14",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  logoutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 10,
  },
  discardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  discardButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#495E57",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
