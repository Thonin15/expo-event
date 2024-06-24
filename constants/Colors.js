/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const Theme = {
	 //primary: '#76A231',
	 primary:'#4B7F52',
	//primary: '#E1AD01',
	secondary: '#007896',
	link: '#00ADCD',
	accents: '#444939',
	tint: '#A8AD9C',
	
};
const tintColorLight = Theme.secondary;
const tintColorDark = '#fff';
export const Colors = {
	light: {
		...Theme,
		text: '#11181C',
		background: '#fff',
		tint: tintColorLight,
		icon: '#687076',
		tabIconDefault: '#687076',
		tabIconSelected: tintColorLight,
		text: '#424242',
	},
	dark: {
		...Theme,
		text: '#424242',
		background: '#151718',
		tint: tintColorDark,
		icon: '#9BA1A6',
		tabIconDefault: '#9BA1A6',
		tabIconSelected: tintColorDark,
	},
};
