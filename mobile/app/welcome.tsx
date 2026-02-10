import { brandColors } from "@/constants/Colors";
import { api } from "@/services/api";
import { storage } from "@/services/storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const [token, user] = await Promise.all([
          storage.getToken(),
          storage.getUser<{ id: string }>(),
        ]);
        if (token && user) {
          // Valider que le token n'est pas périmé
          await api.getUserById(token, user.id);
          router.replace("/(tabs)");
          return;
        }
      } catch {
        // Token périmé ou invalide, on nettoie et on reste sur welcome
        await storage.clear();
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={brandColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>
          <Text style={styles.logoOne}>1</Text>
          <Text style={styles.logoKulte}>KULTE</Text>
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>CONNEXION</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonText}>INSCRIPTION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    flexDirection: "row",
  },
  logoOne: {
    fontSize: 48,
    fontWeight: "900",
    color: brandColors.textWhite,
  },
  logoKulte: {
    fontSize: 48,
    fontWeight: "900",
    color: brandColors.textCream,
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: brandColors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: brandColors.textDark,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
