import { Pressable, Text, View } from 'react-native';
import type { DurationOption, StartOption } from '../types';
import { groupCreateStyles as styles } from '../styles';

type Props = {
  duration: DurationOption;
  startOption: StartOption;
  onSelectDuration: (option: DurationOption) => void;
  onSelectStartOption: (option: StartOption) => void;
};

export function GroupCreateStepTwo({
  duration,
  startOption,
  onSelectDuration,
  onSelectStartOption,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>활동 기간</Text>
      <View style={styles.optionGrid}>
        {(['3일', '1주', '2주', '4주'] as DurationOption[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.optionCard, duration === option ? styles.optionCardActive : undefined]}
            onPress={() => onSelectDuration(option)}
          >
            <Text style={[styles.optionTitle, duration === option ? styles.optionTitleActive : undefined]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, styles.spaced]}>시작일</Text>
      <View style={styles.optionGrid}>
        {(['오늘 시작', '내일 시작'] as StartOption[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.startCard, startOption === option ? styles.optionCardActive : undefined]}
            onPress={() => onSelectStartOption(option)}
          >
            <Text style={styles.calendarIcon}>{option === '오늘 시작' ? '🗓' : '📅'}</Text>
            <Text style={[styles.optionTitle, startOption === option ? styles.optionTitleActive : undefined]}>
              {option}
            </Text>
            <Text style={styles.startDescription}>
              {option === '오늘 시작' ? '오늘부터 팀챌린지,\n지금 바로 시작하기' : '조금 더 준비하고,\n내일부터 시작하기'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
