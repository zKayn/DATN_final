import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#FF6B35',
  secondary: '#004E89',
  accent: '#FFD23F',
  dark: '#1A1A1A',
  light: '#F8F9FA',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  red: {
    50: '#FEF2F2',
    500: '#EF4444',
  },
  green: {
    500: '#10B981',
  },
  blue: {
    50: '#EFF6FF',
    500: '#3B82F6',
    700: '#1D4ED8',
  },
  yellow: {
    500: '#FFD23F',
  },
  orange: {
    500: '#FFA500',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  xxxxl: 36,
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex1: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  px4: {
    paddingHorizontal: spacing.md,
  },
  py3: {
    paddingVertical: spacing.sm,
  },
  p4: {
    padding: spacing.md,
  },
  mb2: {
    marginBottom: spacing.sm,
  },
  mb3: {
    marginBottom: spacing.sm,
  },
  mb4: {
    marginBottom: spacing.md,
  },
  mb6: {
    marginBottom: spacing.lg,
  },
  mt4: {
    marginTop: spacing.md,
  },
  mr2: {
    marginRight: spacing.sm,
  },
  mr3: {
    marginRight: spacing.sm,
  },
  ml2: {
    marginLeft: spacing.sm,
  },
  rounded: {
    borderRadius: borderRadius.md,
  },
  roundedLg: {
    borderRadius: borderRadius.lg,
  },
  roundedXl: {
    borderRadius: borderRadius.xl,
  },
  roundedFull: {
    borderRadius: borderRadius.full,
  },
  bgWhite: {
    backgroundColor: colors.white,
  },
  bgGray50: {
    backgroundColor: colors.gray[50],
  },
  bgGray100: {
    backgroundColor: colors.gray[100],
  },
  bgPrimary: {
    backgroundColor: colors.primary,
  },
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  textWhite: {
    color: colors.white,
  },
  textGray900: {
    color: colors.gray[900],
  },
  textGray700: {
    color: colors.gray[700],
  },
  textGray600: {
    color: colors.gray[600],
  },
  textGray500: {
    color: colors.gray[500],
  },
  textPrimary: {
    color: colors.primary,
  },
  textBase: {
    fontSize: fontSize.base,
  },
  textLg: {
    fontSize: fontSize.lg,
  },
  textXl: {
    fontSize: fontSize.xl,
  },
  text2Xl: {
    fontSize: fontSize.xxl,
  },
  textSm: {
    fontSize: fontSize.sm,
  },
  textXs: {
    fontSize: fontSize.xs,
  },
  border: {
    borderWidth: 1,
  },
  borderGray200: {
    borderColor: colors.gray[200],
  },
  borderGray100: {
    borderColor: colors.gray[100],
  },
  borderPrimary: {
    borderColor: colors.primary,
  },
});

export const screenWidth = width;
export const screenHeight = height;