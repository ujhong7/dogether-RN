import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/Screen';
import { useCertificationDraftStore } from '../../stores/certificationDraftStore';
import { CertificationHeader } from './components/CertificationHeader';
import { PermissionModal } from './components/PermissionModal';
import { certificationStyles as styles } from './styles';
import { colors } from '../../theme/colors';

type PermissionType = 'camera' | 'gallery' | null;

export function CertificationImageScreen() {
  const params = useLocalSearchParams<{
    todoId?: string;
    groupId?: string;
    date?: string;
    content?: string;
  }>();
  const draft = useCertificationDraftStore((state) => state.draft);
  const startDraft = useCertificationDraftStore((state) => state.startDraft);
  const setImageUri = useCertificationDraftStore((state) => state.setImageUri);

  const [permissionType, setPermissionType] = useState<PermissionType>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!params.todoId || !params.groupId || !params.date || !params.content) {
      return;
    }

    startDraft({
      todoId: Number(params.todoId),
      groupId: Number(params.groupId),
      date: params.date,
      todoContent: params.content,
    });
  }, [params.content, params.date, params.groupId, params.todoId, startDraft]);

  const pickImage = async (mode: 'camera' | 'gallery') => {
    setIsLoading(true);
    try {
      if (mode === 'gallery') {
        const current = await ImagePicker.getMediaLibraryPermissionsAsync();
        const permission = current.granted
          ? current
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setPermissionType('gallery');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: false,
        });

        if (!result.canceled) {
          setImageUri(result.assets[0]?.uri ?? null);
        }
        return;
      }

      const current = await ImagePicker.getCameraPermissionsAsync();
      const permission = current.granted ? current : await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setPermissionType('camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0]?.uri ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <CertificationHeader />

        <View style={styles.imageBox}>
          {draft.imageUri ? (
            <Image source={{ uri: draft.imageUri }} style={styles.selectedImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderWrap}>
              <Text style={styles.placeholderEmoji}>📸</Text>
              <Text style={styles.placeholderText}>인증 사진을 업로드 해주세요!</Text>
            </View>
          )}

          {isLoading ? <ActivityIndicator color={colors.primary} style={{ position: 'absolute' }} /> : null}
        </View>

        <Text style={styles.todoTitle}>{draft.todoContent || '인증할 투두를 확인하세요'}</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.mediaButton} onPress={() => pickImage('gallery')}>
            <Text style={styles.mediaButtonText}>🖼</Text>
            <Text style={styles.mediaButtonText}>사진 선택</Text>
          </Pressable>
          <Pressable style={styles.mediaButton} onPress={() => pickImage('camera')}>
            <Text style={styles.mediaButtonText}>📷</Text>
            <Text style={styles.mediaButtonText}>사진 촬영</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.footerButton, !draft.imageUri ? styles.footerButtonDisabled : undefined]}
          disabled={!draft.imageUri}
          onPress={() => router.push('/certify-content')}
        >
          <Text style={styles.footerButtonText}>다음</Text>
        </Pressable>
      </KeyboardAvoidingView>

      <PermissionModal
        visible={permissionType === 'camera'}
        title="카메라 권한이 꺼져 있어요."
        description="인증을 위해 설정에서 카메라 권한을 켜주세요."
        onClose={() => setPermissionType(null)}
      />
      <PermissionModal
        visible={permissionType === 'gallery'}
        title="사진 접근이 제한되어 있어요."
        description="인증을 위해 설정에서 사진 접근을 허용해주세요."
        onClose={() => setPermissionType(null)}
      />
    </Screen>
  );
}
