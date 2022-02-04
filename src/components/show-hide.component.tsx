import React from 'react';
import {
	StyleSheet,
	TouchableWithoutFeedback,
	View
} from 'react-native';

import Colors from '../constants/colors';
import NalliCopy from './copy.component';
import NalliText, { ETextSize } from './text.component';

interface ShowHideProps {
	showText?: string;
	hideText?: string;
	containerStyle?: any;
	allowCopy?: boolean;
	confirmCopy?: boolean;
	copyValue?: string;
}

interface ShowHideState {
	show: boolean;
}

export default class ShowHide extends React.Component<ShowHideProps, ShowHideState> {

	constructor(props) {
		super(props);
		this.state = {
			show: false,
		}
	}

	toggle = () => {
		this.setState({ show: !this.state.show });
	}

	render = () => {
		const {
			allowCopy,
			children,
			confirmCopy,
			containerStyle,
			copyValue,
			hideText,
			showText,
		} = this.props;
		const { show } = this.state;
		return (
			<View style={containerStyle ? containerStyle : undefined}>
				<View style={styles.title}>
					<TouchableWithoutFeedback onPress={this.toggle}>
						<View style={styles.showhide}>
							<NalliText size={ETextSize.BUTTON_SMALL} style={styles.showhideText}>{!show ? showText || 'Show' : hideText || 'Hide'}</NalliText>
						</View>
					</TouchableWithoutFeedback>
					{allowCopy &&
						<NalliCopy
								value={copyValue}
								confirm={confirmCopy}
								style={styles.copyButton} />
					}
				</View>
				{show &&
					<View style={styles.content}>
						{children}
					</View>
				}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	title: {
		flexDirection: 'row',
		alignSelf: 'center',
	},
	showhide: {
		marginBottom: 10,
		backgroundColor: 'rgba(200, 200, 200, 0.15)',
		alignSelf: 'center',
		paddingHorizontal: 30,
		paddingVertical: 5,
		borderRadius: 15,
	},
	showhideText: {
		color: Colors.main,
	},
	content: {
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderWidth: 1,
		borderRadius: 15,
		borderStyle: 'solid',
		borderColor: Colors.borderColor,
	},
	copyButton: {
		position: 'absolute',
		right: -40,
		top: 5,
	},
});
