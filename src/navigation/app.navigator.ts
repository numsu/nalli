import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';

import Colors from '../constants/colors';
import AuthLoadingScreen from '../screens/auth-loading.screen';
import LoginScreen from '../screens/login.screen';
import WelcomeOtpScreen from '../screens/welcome-otp.screen';
import WelcomePinScreen from '../screens/welcome-pin.screen';
import WelcomeScreen from '../screens/welcome.screen';
import CreateWallet from './create-wallet.navigator';
import HomeStack from './main-tab.navigator';

const AuthStack = createStackNavigator(
	{
		Welcome: WelcomeScreen,
		WelcomeOtp: WelcomeOtpScreen,
		WelcomePin: WelcomePinScreen,
	}, {
		defaultNavigationOptions: {
			headerStyle: {
				backgroundColor: Colors.main,
				elevation: 0,
				borderBottomWidth: 0,
			},
			headerTintColor: 'white',
			headerTitleStyle: {
				fontWeight: 'bold',
				color: 'white',
			},
		},
	},
);

export default createAppContainer(createSwitchNavigator(
	{
		Login: LoginScreen,
		AuthLoading: AuthLoadingScreen,
		Auth: AuthStack,
		Main: HomeStack,
		CreateWallet,
	}, {
		initialRouteName: 'AuthLoading',
	},
));
