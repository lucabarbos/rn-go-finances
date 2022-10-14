import React from "react";
import { ThemeProvider } from "styled-components/native";
import { NavigationContainer } from "@react-navigation/native";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import theme from "./src/global/styles/theme";

import { StatusBar } from "expo-status-bar";
import { AppRoutes } from "./src/routes/app.routes";
import { SignIn } from "./src/screens/SignIn";
import { AuthProvider } from "./src/hooks/auth";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar backgroundColor={theme.colors.primary} style="light" />
      <NavigationContainer>
        <AuthProvider>
          <SignIn />
        </AuthProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
}
