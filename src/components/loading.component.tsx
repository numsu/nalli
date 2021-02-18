import React from 'react';
import {
	ActivityIndicator,
	StyleSheet,
} from 'react-native';

interface LoadingProps {
	show: boolean;
	lighter?: boolean;
}

export default class Loading extends React.Component<LoadingProps, any> {

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
		const { lighter } = this.props;
		if (show) {
			return (
				<ActivityIndicator color="#fff" size="large" style={[styles.activity, lighter ? styles.lighter : undefined]} />
			);
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
		backgroundColor: 'rgba(170, 170, 170, 0.7)',
		padding: '5%',
		borderRadius: 15,
	},
	lighter: {
		backgroundColor: 'rgba(240, 240, 240, 0.3)',
	}
});
