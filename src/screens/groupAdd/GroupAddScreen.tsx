import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { GroupEntryCards } from '../start/components/GroupEntryCards';
import { colors } from '../../theme/colors';

export function GroupAddScreen() {
  return (
    <Screen>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>새 그룹 추가</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.cardsWrap}>
        <GroupEntryCards />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  back: {
    color: colors.text,
    fontSize: 24,
  },
  navTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  navSpacer: {
    width: 24,
  },
  cardsWrap: {
    marginTop: 8,
  },
});
