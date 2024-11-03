import dataset from '../model/landmark.json' with { type: 'json' }
import KNNClassifier from './packages/knn.mjs'

const knn = new KNNClassifier(dataset.X_train, dataset.y_train)
const labels = {
  0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I',
  9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q',
  17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y',
  25: 'Z', 26: ' ', 27: 'next',
}
/**
 * @param {{ x: number, y: number }[]} landmarks
 * @param {number=} k
 */
export function predictSign(landmarks, k=3) {
  const point = landmarks.flatMap(({ x, y, z }) => [x, y, z])
  const prediction = knn.predict(point, k)

  return labels[prediction.topClass]
}
