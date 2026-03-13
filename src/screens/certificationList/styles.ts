import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const certificationListStyles = StyleSheet.create({
  flex: {
    flex: 1,
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
  headingWrap: {
    gap: 4,
    marginBottom: 18,
  },
  headingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  headingTextLarge: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 24,
  },
  headingAccent: {
    color: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  summaryIcon: {
    fontSize: 17,
  },
  summaryLabel: {
    color: '#D8DCE7',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCount: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryCountAccent: {
    color: colors.primary,
  },
  controlsRow: {
    marginBottom: 18,
  },
  controlsContent: {
    paddingRight: 8,
    gap: 8,
    alignItems: 'center',
  },
  sortButton: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B4254',
    backgroundColor: '#0D1221',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  sortButtonChevron: {
    color: '#96A2BE',
    fontSize: 14,
    fontWeight: '700',
  },
  filterButton: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B4254',
    backgroundColor: '#0D1221',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterActiveText: {
    color: '#111318',
  },
  filterText: {
    color: '#A7B0C4',
    fontSize: 13,
    fontWeight: '700',
  },
  filterIcon: {
    color: '#A7B0C4',
    fontSize: 12,
  },
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#E7EBF7',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48.5%',
    aspectRatio: 0.78,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1C2232',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardBadgeText: {
    color: '#111318',
    fontSize: 12,
    fontWeight: '800',
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1F2D',
  },
  cardPlaceholderText: {
    fontSize: 28,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 72,
  },
  emptyIllustrationWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1.5,
    borderColor: '#666F8E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIllustration: {
    fontSize: 58,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#7D889F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
