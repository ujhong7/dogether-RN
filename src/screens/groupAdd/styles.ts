import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
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
