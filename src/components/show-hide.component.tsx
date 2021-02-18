import React from 'react';
import {
	Alert,
	Clipboard,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';

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
			<View style={[styles.container, containerStyle ? containerStyle : undefined]}>
				<View style={styles.title}>
					<Text style={styles.showhide} onPress={this.toggle}>
						{!show ? showText || 'Show' : hideText || 'Hide'}
					</Text>
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
	container: {
	},
	title: {
		flexDirection: 'row',
		alignSelf: 'center',
	},
	showhide: {
		fontSize: 18,
		marginBottom: 10,
		color: Colors.main,
		backgroundColor: Colors.borderColor,
		alignSelf: 'center',
		paddingHorizontal: 30,
		paddingVertical: 5,
	},
	content: {
		paddingHorizontal: 5,
		paddingVertical: 10,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: Colors.disabledButton,
	},
	copyButton: {
		position: 'absolute',
		right: -40,
		top: 5,
	},
});
