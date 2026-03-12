import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const certificationDetailStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBack: {
    color: colors.text,
    fontSize: 24,
    width: 24,
  },
  navTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  navSpacer: {
    width: 24,
  },
  thumbList: {
    maxHeight: 54,
    marginBottom: 12,
  },
  thumbContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  thumbCard: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbCardActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    color: colors.muted,
    fontSize: 18,
  },
  mediaCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 18,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    paddingBottom: 24,
  },
  page: {
    paddingRight: 16,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(17, 24, 39, 0.88)',
  },
  mediaOverlayText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 78,
  },
  emptyCaption: {
    color: colors.muted,
    fontSize: 13,
  },
  todoTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'center',
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusBadgeText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackBox: {
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  feedbackText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
