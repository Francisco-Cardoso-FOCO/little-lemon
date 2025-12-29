import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "./screens/Onboarding";
import ProfileScreen from "./screens/ProfileScreen";
import SplashScreen from "./screens/SplashScreen";
import { Header } from "./components/header";
import HomeScreen from "./screens/HomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_KEY } from "./screens/Onboarding";

const Stack = createNativeStackNavigator();

export type InicialStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Profile: undefined;
};

type InicialStackProps = {
  initialRouteName?: keyof InicialStackParamList;
};

type AppState = {
  isLoading: boolean;
  isOnboardingCompleted: boolean;
};

export default function InicialStack({}: InicialStackProps) {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    isOnboardingCompleted: false,
  });

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem(ONBOARDING_KEY);
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        isOnboardingCompleted: onboardingStatus === "true",
      }));
    } catch (error) {
      console.error("Error reading onboarding status:", error);
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        isOnboardingCompleted: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={state.isOnboardingCompleted ? "Home" : "Onboarding"}
      screenOptions={{
        header: () => <Header />,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
