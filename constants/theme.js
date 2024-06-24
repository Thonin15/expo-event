import { Dimensions } from 'react-native'
const { height, width } = Dimensions.get('window');

const COLORS = {
  primary: "#2A4D50",
  secondary: "#DDF0FF",
  tertiary: "#FF7754",

  gray: "#83829A",
  gray2: "#C1C0C8",
  blue: "#1B7EB5",
  red: "#DB3737",
  offwhite: "#F3F4F8",
  white: "#FFFFFF",
  darkwhite: "FAFAFA",
  black: "#000000",
  red: "#e81e4d",
  green: "#4B7F52",
  lightWhite: "#FAFAFC",
  official_color: "#4B7F52",
  borderGrey: '#BEBEBE',
  gold: '#E1AD01',
};


const SIZES = {
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 18,
  xLarge: 24,
  xxLarge: 44,
  height,
  width
};


const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};


export { COLORS, SIZES , SHADOWS };
