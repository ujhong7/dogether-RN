import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const completeStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 18,
  },
  icon: {
    color: '#5B9DF0',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 28,
  },
  codeCard: {
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  codeText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  shareIcon: {
    color: '#C7CCDB',
    fontSize: 20,
  },
  helpText: {
    color: '#8C91A7',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },
  groupName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoKey: {
    color: '#5B9DF0',
    fontWeight: '700',
  },
  infoValue: {
    color: '#D1D5E5',
  },
  button: {
    marginTop: 'auto',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#04210E',
    fontWeight: '800',
  },
});
