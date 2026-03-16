import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const rankingStyles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  titleBadge: {
    backgroundColor: '#FFEB3B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  titleBadgeText: {
    color: '#111318',
    fontSize: 20,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 32,
  },
  topThreeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
  },
  topCardWrap: {
    flex: 1,
    alignItems: 'center',
  },
  topCardWrapRaised: {
    marginBottom: 18,
  },
  crown: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  topCard: {
    width: '100%',
    backgroundColor: '#2A2B31',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 146,
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarPlainRing: {
    backgroundColor: 'transparent',
  },
  avatarUnreadRing: {
    backgroundColor: '#FF5C92',
    borderColor: '#FF5C92',
  },
  avatarReadRing: {
    backgroundColor: '#646A7A',
    borderColor: '#646A7A',
  },
  avatarFace: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B9DF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1B1E27',
  },
  avatarUnreadOverlay: {
    position: 'absolute',
    top: -12,
    right: 6,
    color: '#58A6FF',
    fontSize: 32,
  },
  avatarEyeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  avatarEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111318',
  },
  avatarBeak: {
    width: 10,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F8E28A',
  },
  topName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  topRate: {
    color: '#58A6FF',
    fontSize: 13,
    fontWeight: '700',
  },
  noticeBox: {
    marginTop: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3A3E4A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeIcon: {
    color: '#8C91A7',
    fontSize: 14,
  },
  noticeText: {
    color: '#8C91A7',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    gap: 14,
    paddingBottom: 16,
  },
  emptyListWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankText: {
    width: 16,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  nameText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateIcon: {
    color: '#58A6FF',
    fontSize: 14,
  },
  rateText: {
    color: '#58A6FF',
    fontSize: 18,
    fontWeight: '800',
  },
});
