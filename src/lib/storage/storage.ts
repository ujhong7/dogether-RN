// MARK: - MMKV Instance
//
// 역할: RN 앱에서 사용할 로컬 key-value 저장소 인스턴스를 생성합니다.

import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'dogether-storage' });
