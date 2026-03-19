import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 32,
  },
  list: {
    gap: 28,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionRow: {
    marginTop: 8,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  rowChevron: {
    color: '#C8D0E4',
    fontSize: 28,
    fontWeight: '500',
  },
  versionText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 18,
    backgroundColor: '#2A2B31',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalMessage: {
    color: '#B0B7C9',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  modalButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#5A5D67',
  },
  logoutButton: {
    backgroundColor: colors.primary,
  },
  withdrawButton: {
    backgroundColor: '#FF4F7A',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButtonText: {
    color: '#111318',
    fontSize: 16,
    fontWeight: '800',
  },
});
