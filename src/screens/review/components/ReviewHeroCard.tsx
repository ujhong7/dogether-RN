// MARK: - Review Hero Card
//
// 역할: 리뷰 대상 인증 이미지와 기본 정보를 크게 보여주는 상단 카드입니다.

import { Image, Text, View } from 'react-native';
import { reviewStyles as styles } from '../styles';

type Props = {
  mediaUrl: string;
  content: string;
  doer: string;
  todoContent: string;
};

export function ReviewHeroCard({ mediaUrl, content, doer, todoContent }: Props) {
  return (
    <>
      <View style={styles.heroCard}>
        <Image source={{ uri: mediaUrl }} style={styles.heroImage} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroContent}>{content}</Text>
          <Text style={styles.heroDoer}>{doer}</Text>
        </View>
      </View>

      <Text style={styles.todoTitle}>{todoContent}</Text>
    </>
  );
}
