import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import InicialStack, { InicialStackParamList } from "./app/InicialStack";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";

const navigationRef = createNavigationContainerRef<InicialStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const AppContent = () => {
  const onLayoutRootView = useCallback(async () => {
    // Hide splash screen when layout is ready
    await SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer ref={navigationRef}>
        <InicialStack />
      </NavigationContainer>
    </View>
  );
};
export default App;
