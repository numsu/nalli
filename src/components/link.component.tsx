import React from 'react';
import {
	Alert,
	Linking,
	StyleSheet,
	Text,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/colors';

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

	open = (url) => {
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
					onPress: () => Linking.openURL(url),
					style: 'default',
				},
			]
		);
	}

	render = () => {
		const { url, style, children } = this.props;
		return (
			<Text
					style={[styles.link, style ? style : undefined]}
					onPress={() => this.open(url)}>
				<Ionicons name='ios-link' size={15} />&nbsp;{children}
			</Text>
		);
	}

}

const styles = StyleSheet.create({
	link: {
		color: Colors.main,
		fontFamily: 'OpenSans',
	},
});
