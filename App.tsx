import 'react-native-gesture-handler';

import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as encoding from 'text-encoding';

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainNavigator from './src/navigation/app.navigator';
import { navigationRef } from './src/service/navigation.service';

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

const Stack = createNativeStackNavigator();

export default class App extends React.PureComponent<any, any> {

	state = {
		isLoadingComplete: false,
	};

	constructor(props) {
		super(props);
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
				<NavigationContainer ref={navigationRef}>
					<GestureHandlerRootView style={styles.container}>
						<BottomSheetModalProvider>
							<StatusBar translucent hidden={false} style='dark' />
							<Stack.Navigator initialRouteName='Main' screenOptions={{ headerShown: false }}>
								<Stack.Screen name='Main' component={MainNavigator} />
							</Stack.Navigator>
						</BottomSheetModalProvider>
					</GestureHandlerRootView>
				</NavigationContainer>
			);
		}
	}

	private loadResourcesAsync = async () => {
		if (TextEncoder == undefined || typeof TextEncoder !== 'function') {
			TextEncoder = encoding.TextEncoder;
			TextDecoder = encoding.TextDecoder;
		}

		await Promise.all([
			Asset.loadAsync([
				require('./src/assets/images/splash.png'),
				require('./src/assets/images/icon.png'),
			]),
			Font.loadAsync({
				...customFonts,
			}),
		]).catch(e => {
			console.error(e);
		});
	}

	private handleLoadingError = (error: Error) => {
		Alert.alert(
			'Error during app load',
			error.message,
			[
				{ text: 'Ok' },
			],
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
