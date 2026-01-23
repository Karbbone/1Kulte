import { brandColors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

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
