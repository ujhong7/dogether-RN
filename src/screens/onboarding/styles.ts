import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appleButtonWrapper: {
    marginTop: 6,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  buttonText: {
    color: '#04210E',
    fontWeight: '700',
  },
  kakaoText: {
    color: '#181600',
    fontWeight: '700',
  },
  ghostText: {
    color: colors.text,
    fontWeight: '600',
  },
});
