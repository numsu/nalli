import React from 'react';
import {
	Alert,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import { Clipboard } from 'react-native'

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
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

	copy = () => {
		if (this.props.allowCopy) {
			const setClipboard = () => Clipboard.setString(this.props.copyValue);
			if (this.props.confirmCopy) {
				Alert.alert(
					'Confirm',
					'Are you sure that you want to copy this information? It\'s sensitive information and the clipboard can compromise it.',
					[
						{
							text: 'Cancel',
							onPress: () => undefined,
							style: 'default',
						}, {
							text: 'Copy',
							onPress: setClipboard,
							style: 'destructive',
						},
					],
				);
			} else {
				setClipboard();
			}
		}
	}

	render = () => {
		const { allowCopy, children, showText, hideText, containerStyle } = this.props;
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
						<TouchableOpacity
								style={styles.copyButton}
								onPress={this.copy}>
							<Ionicons
									name="ios-copy"
									size={18} />
						</TouchableOpacity>
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
