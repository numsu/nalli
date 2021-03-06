import React from 'react';
import {
	Alert,
	Linking,
	StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import NalliText from './text.component';

interface LinkProps {
	url: string;
	style?: any;
}

interface LinkState {
}

export default class Link extends React.Component<LinkProps, LinkState> {

	constructor(props) {
		super(props);
	}

	open = () => {
		Alert.alert(
			'Leave Nalli?',
			'This link will take you outside of the application. Are you sure?',
			[
				{
					text: 'Cancel',
					onPress: () => undefined,
					style: 'cancel',
				}, {
					text: 'Open',
					onPress: () => Linking.openURL(this.props.url),
					style: 'default',
				},
			]
		);
	}

	render = () => {
		const { style, children } = this.props;
		return (
			<NalliText
					style={[styles.link, style ? style : undefined]}
					onPress={this.open}>
				<Ionicons name='ios-link' size={15} />&nbsp;{children}
			</NalliText>
		);
	}

}

const styles = StyleSheet.create({
	link: {
		color: Colors.main,
	},
});
