import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { GroupEntryCards } from './components/GroupEntryCards';
import { startStyles as styles } from './styles';

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
