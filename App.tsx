import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { setCustomText } from 'react-native-global-props';
import { enableScreens } from 'react-native-screens';
import * as encoding from 'text-encoding';

import { FontAwesome, Ionicons } from '@expo/vector-icons';

import AppNavigator from './src/navigation/app.navigator';
import NavigationService from './src/service/navigation.service';

const customFonts = {
	...Ionicons.font,
	...FontAwesome.font,
	'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
	'Material Icons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
	'Material Design Icons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
	'MaterialDesignIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
	'OpenSans': require('./src/assets/fonts/OpenSans-Regular.ttf'),
	'OpenSansBold': require('./src/assets/fonts/OpenSans-SemiBold.ttf'),
	'MontserratBold': require('./src/assets/fonts/Montserrat-SemiBold.ttf'),
};

export default class App extends React.Component<any, any> {

	state = {
		isLoadingComplete: false,
	};

	constructor(props) {
		super(props);
		enableScreens();
	}

	render = () => {
		if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
			return (
				<AppLoading
						startAsync={this.loadResourcesAsync}
						onError={this.handleLoadingError}
						onFinish={this.handleFinishLoading} />
			);
		} else {
			return (
				<View style={styles.container}>
					<StatusBar translucent={true} hidden={false} style="dark" />
					<AppNavigator
							ref={navigatorRef => NavigationService.setTopLevelNavigator(navigatorRef)} />
				</View>
			);
		}
	}

	private loadResourcesAsync = async () => {
		Promise.all([
			Asset.loadAsync([
				require('./src/assets/images/splash.png'),
				require('./src/assets/images/icon.png'),
			]),
			Font.loadAsync({
				...customFonts,
			}),
		]).then(() => {
			setCustomText({
				fontFamily: 'OpenSans',
			});
		});

		if (TextEncoder == undefined || typeof TextEncoder !== 'function') {
			TextEncoder = encoding.TextEncoder;
			TextDecoder = encoding.TextDecoder;
		}
	}

	private handleLoadingError = (error: Error) => {
		Alert.alert(
			'Error during app load',
			error.message,
			[
				{
					text: 'Ok',
					onPress: () => undefined,
					style: 'default',
				},
			]
		);
		console.error(error);
	}

	private handleFinishLoading = () => {
		this.setState({ isLoadingComplete: true });
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
