import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { GroupEntryCards } from './GroupEntryCards';
import { colors } from '../../theme/colors';

export function StartScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.logo}>dogether</Text>
        <Text style={styles.headerIcon}>→</Text>
      </View>

      <Text style={styles.title}>소속된 그룹이 없어요.</Text>
      <Text style={styles.title}>그룹을 만들거나 참여하세요!</Text>
      <GroupEntryCards />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerIcon: {
    color: colors.text,
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
});
