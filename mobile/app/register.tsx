import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { brandColors } from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color={brandColors.textCream} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Inscription</Text>
        {/* Form fields will be added here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: brandColors.textWhite,
    marginBottom: 40,
  },
});
