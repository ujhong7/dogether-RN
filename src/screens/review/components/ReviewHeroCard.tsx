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
