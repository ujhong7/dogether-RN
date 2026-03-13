import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen } from '../../components/Screen';
import { env } from '../../config/env';
import { resetMockAppData } from '../../lib/resetMockAppData';
import { useMainStore } from '../../stores/mainStore';
import { useSessionStore } from '../../stores/sessionStore';
import { colors } from '../../theme/colors';

type ConfirmVariant = 'logout' | 'withdraw';

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const logout = useSessionStore((state) => state.logout);
  const setSelectedGroupId = useMainStore((state) => state.setSelectedGroupId);
  const [confirmVariant, setConfirmVariant] = useState<ConfirmVariant | null>(null);

  const closeConfirm = () => setConfirmVariant(null);

  const moveToOnboarding = () => {
    queryClient.clear();
    setSelectedGroupId(null);
    router.replace('/onboarding');
  };

  const handleLogout = () => {
    logout();
    moveToOnboarding();
  };

  const handleWithdraw = () => {
    resetMockAppData();
    logout();
    moveToOnboarding();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.list}>
        <Pressable style={styles.row} onPress={() => setConfirmVariant('logout')}>
          <Text style={styles.rowLabel}>로그아웃</Text>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => setConfirmVariant('withdraw')}>
          <Text style={styles.rowLabel}>회원 탈퇴</Text>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>

        <View style={[styles.row, styles.versionRow]}>
          <Text style={styles.rowLabel}>앱 버전</Text>
          <Text style={styles.versionText}>{env.appVersion}</Text>
        </View>
      </View>

      {confirmVariant ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {confirmVariant === 'logout' ? '로그아웃 하시겠어요?' : '정말 회원탈퇴를 하시겠어요?'}
            </Text>
            <Text style={styles.modalMessage}>
              {confirmVariant === 'logout'
                ? '로그아웃 후 다시 로그인해야 서비스를 이용할 수 있어요.'
                : '탈퇴하면 모든 데이터가 삭제되며\n복구할 수 없어요.'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={closeConfirm}>
                <Text style={styles.cancelButtonText}>뒤로가기</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  confirmVariant === 'logout' ? styles.logoutButton : styles.withdrawButton,
                ]}
                onPress={confirmVariant === 'logout' ? handleLogout : handleWithdraw}
              >
                <Text style={styles.confirmButtonText}>
                  {confirmVariant === 'logout' ? '로그아웃' : '탈퇴하기'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
