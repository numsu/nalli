import { Dimensions } from 'react-native';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default {
	window: {
		width,
		height,
	},
	isSmallDevice: height <= 690,
};
