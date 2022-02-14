import LottieView from 'lottie-react-native';
import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';

export enum LoadingStyle {
	NONE,
	LIGHT,
	DARK,
}

interface LoadingProps {
	show: boolean;
	style?: LoadingStyle;
	color?: 'main' | 'white';
}

export default class Loading extends React.Component<LoadingProps, any> {

	animation;

	constructor(props) {
		super(props);
		this.state = {
			show: false,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.show != prevState.show) {
			return { show: nextProps.show };
		}
		return null;
	}

	render = () => {
		const { show } = this.state;

		if (show) {
			const style = this.props.style ?? LoadingStyle.DARK;
			const color = this.props.color ?? 'main';
			const source = color == 'white'
					? require('../assets/lottie/loading-white.json')
					: require('../assets/lottie/loading-blue.json');
			const styleInt = [styles.activity] as any[];
			if (style == LoadingStyle.LIGHT) {
				styleInt.push(styles.lighter);
			}

			const lottie = (
				<LottieView
						ref={animation => {
							this.animation = animation;
						}}
						onLayout={() => this.animation.play()}
						loop
						resizeMode='cover'
						source={source} />
			);

			if (style == LoadingStyle.NONE) {
				return lottie;
			} else {
				return (
					<View style={styleInt}>
						{lottie}
					</View>
				);
			}
		} else {
			return (<></>);
		}
	}

}

const styles = StyleSheet.create({
	activity: {
		position: 'absolute',
		top: '30%',
		left: '40%',
		backgroundColor: 'rgba(170, 170, 170, 0.3)',
		borderRadius: 15,
		height: 80,
		width: 80,
	},
	lighter: {
		backgroundColor: 'rgba(240, 240, 240, 0.2)',
	},
});
