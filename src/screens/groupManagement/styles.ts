import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
  },
  leaveButton: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#333741',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoLabel: {
    color: '#8D95A8',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: '#E8EBF5',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#2A2B31',
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalMessage: {
    color: '#A5ADBF',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#5A5D67',
  },
  modalConfirmButton: {
    backgroundColor: '#FF4F7A',
  },
  modalConfirmButtonDisabled: {
    opacity: 0.6,
  },
  modalCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalConfirmText: {
    color: '#111318',
    fontSize: 16,
    fontWeight: '800',
  },
});
