import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const startStyles = StyleSheet.create({
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
