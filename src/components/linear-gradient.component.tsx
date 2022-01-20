import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
	StyleSheet,
} from 'react-native';

interface LinearGradientProps {
	bottom?: boolean;
	style?: any;
	start?: number;
}

interface LinearGradientState {
}

export default class NalliLinearGradient extends React.Component<LinearGradientProps, LinearGradientState> {

	constructor(props) {
		super(props);
	}

	render = () => {
		const { bottom, start, style } = this.props;
		if (bottom) {
			return (
				<LinearGradient
						colors={[ 'rgba(255, 255, 255, 0.0)', 'white' ]}
						style={[ styles.bottomContainerBackground, style ]}
						start={{ x: 0.5, y: start ?? 0 }}
						end={{ x: 0.5, y: 1 }} />
			);
		} else {
			return (
				<LinearGradient
						colors={[ 'white', 'rgba(255, 255, 255, 0.0)' ]}
						style={[ styles.topContainerBackground, style ]}
						start={{ x: 0.5, y: start ?? 0 }}
						end={{ x: 0.5, y: 1 }} />
			);
		}
	}

}

const styles = StyleSheet.create({
	topContainerBackground: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		width: '100%',
		height: 25,
		zIndex: 1,
	},
	bottomContainerBackground: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: 30,
		zIndex: 1,
	},
});
