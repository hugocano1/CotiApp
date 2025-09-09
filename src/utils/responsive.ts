import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 375;

/**
 * Scales a size based on the screen width.
 * @param size The size to scale.
 * @returns The scaled size.
 */
export const scale = (size: number) => (width / guidelineBaseWidth) * size;

/**
 * Scales a font size.
 * On smaller devices, it prevents fonts from becoming too small.
 * @param size The font size to scale.
 * @returns The scaled font size.
 */
export const scaleFont = (size: number) => {
  const scaledSize = scale(size);
  // Make sure font size doesn't get too small on smaller devices
  return Math.max(12, Math.round(scaledSize));
};
