import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { env } from '../../config/env';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { styles } from './styles';

export function SettingsScreen() {
  const {
    confirmVariant,
    openLogoutConfirm,
    openWithdrawConfirm,
    closeConfirm,
    handleLogout,
    handleWithdraw,
  } = useSettingsScreen();

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
        <Pressable style={styles.row} onPress={openLogoutConfirm}>
          <Text style={styles.rowLabel}>로그아웃</Text>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={openWithdrawConfirm}>
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
