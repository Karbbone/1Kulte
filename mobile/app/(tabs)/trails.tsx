import { StyleSheet, Text, View } from 'react-native';
import { brandColors } from '@/constants/Colors';

export default function TrailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parcours</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: brandColors.textWhite,
  },
});
