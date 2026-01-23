// 1KULTE Brand Colors
export const brandColors = {
  // Primary colors
  background: '#3D3632',
  backgroundDark: '#342F2D',
  primary: '#E8C872',
  primaryDark: '#D4B560',

  // Text colors
  textWhite: '#FFFFFF',
  textCream: '#F5F0E6',
  textDark: '#3D3632',

  // UI colors
  border: '#4A4543',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const tintColorLight = brandColors.primary;
const tintColorDark = brandColors.primary;

export default {
  light: {
    text: brandColors.textDark,
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: brandColors.textWhite,
    background: brandColors.background,
    tint: tintColorDark,
    tabIconDefault: brandColors.textCream,
    tabIconSelected: tintColorDark,
  },
};
