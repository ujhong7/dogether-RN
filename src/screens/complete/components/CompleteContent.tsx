import { Text, View } from 'react-native';
import type { CompletePayload } from '../../../stores/startFlowStore';
import { completeStyles as styles } from '../styles';

type Props = {
  payload: CompletePayload;
};

export function CompleteContent({ payload }: Props) {
  const title =
    payload.kind === 'create'
      ? '그룹 생성 완료!\n팀원들에게 코드를 공유해보세요'
      : '그룹 가입 완료!\n이제 목표를 실천해보세요';

  return (
    <>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⤴</Text>
      </View>
      <Text style={styles.title}>{title}</Text>

      {payload.kind === 'create' ? (
        <>
          <View style={styles.codeCard}>
            <Text style={styles.codeText}>{payload.joinCode}</Text>
            <Text style={styles.shareIcon}>⤴</Text>
          </View>
          <Text style={styles.helpText}>카카오톡, 문자 등을 통해 공유해보세요 !</Text>
        </>
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.groupName}>{payload.groupName}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>총 기간</Text>
            <Text style={styles.infoValue}>{payload.durationLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>그룹원</Text>
            <Text style={styles.infoValue}>{payload.memberCountLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>시작일</Text>
            <Text style={styles.infoValue}>{payload.startDateLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>종료일</Text>
            <Text style={styles.infoValue}>{payload.endDateLabel}</Text>
          </View>
        </View>
      )}
    </>
  );
}
