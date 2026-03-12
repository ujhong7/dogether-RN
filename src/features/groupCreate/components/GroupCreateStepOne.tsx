import { Pressable, Text, TextInput, View } from 'react-native';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  groupName: string;
  memberCount: number;
  isFocused: boolean;
  onChangeGroupName: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDecreaseMemberCount: () => void;
  onIncreaseMemberCount: () => void;
};

export function GroupCreateStepOne({
  groupName,
  memberCount,
  isFocused,
  onChangeGroupName,
  onFocus,
  onBlur,
  onDecreaseMemberCount,
  onIncreaseMemberCount,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>그룹명</Text>
      <View>
        <TextInput
          value={groupName}
          onChangeText={(text) => onChangeGroupName(text.slice(0, 20))}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="멋진 그룹명으로 동기부여를 해보세요 !"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          style={[styles.input, isFocused ? styles.inputFocused : undefined]}
        />
        <Text style={[styles.counterText, isFocused ? styles.counterTextFocused : undefined]}>
          {groupName.trim().length}/20
        </Text>
      </View>

      <Text style={[styles.label, styles.spaced]}>그룹 인원</Text>
      <View style={styles.counterBox}>
        <Pressable style={styles.counterButton} onPress={onDecreaseMemberCount}>
          <Text style={styles.counterButtonText}>−</Text>
        </Pressable>
        <Text style={styles.memberCount}>{memberCount}명</Text>
        <Pressable style={styles.counterButton} onPress={onIncreaseMemberCount}>
          <Text style={styles.counterButtonText}>＋</Text>
        </Pressable>
      </View>
      <View style={styles.counterGuide}>
        <Text style={styles.counterGuideText}>2명</Text>
        <Text style={styles.counterGuideText}>20명</Text>
      </View>
    </View>
  );
}
