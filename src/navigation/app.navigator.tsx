import { PureComponent } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Colors from '../constants/colors';
import AuthLoadingScreen from '../screens/auth-loading.screen';
import CreateWalletWelcome from '../screens/create-wallet/create-wallet-welcome.screen';
import CreateWalletMnemonic from '../screens/create-wallet/create/create-wallet-mnemonic.screen';
import CreateWalletNew from '../screens/create-wallet/create/create-wallet-new.screen';
import CreateWalletImportMnemonic from '../screens/create-wallet/import/create-wallet-import-mnemonic.screen';
import CreateWalletImportSeed from '../screens/create-wallet/import/create-wallet-import-seed.screen';
import CreateWalletImport from '../screens/create-wallet/import/create-wallet-import.screen';
import Permissions from '../screens/create-wallet/permissions.screen';
import HomeScreen from '../screens/home/home.screen';
import LoginScreen from '../screens/login.screen';
import WelcomeOtpScreen from '../screens/welcome-otp.screen';
import WelcomePinScreen from '../screens/welcome-pin.screen';
import WelcomeScreen from '../screens/welcome.screen';

export type Navigation = {
	navigation: any;
}

const Stack = createNativeStackNavigator();

class AuthNavigator extends PureComponent<any, any> {

	render = () => {
		return (
			<Stack.Navigator
					initialRouteName='Welcome'
					screenOptions={{
						headerStyle: {
							backgroundColor: Colors.main,
						},
						headerTintColor: 'white',
						headerTitleStyle: {
							fontWeight: 'bold',
							color: 'white',
						}
					}}>
				<Stack.Screen name='Welcome' options={{ headerShown: false }} component={WelcomeScreen} />
				<Stack.Screen name='WelcomeOtp' options={{ headerTitle: 'Enter SMS code' }} component={WelcomeOtpScreen} />
				<Stack.Screen name='WelcomePin' options={{ headerTitle: 'Set PIN', headerBackVisible: false }} component={WelcomePinScreen} />
			</Stack.Navigator>
		);
	}

}

class CreateWalletNavigator extends PureComponent<any, any> {

	render = () => {
		return (
			<Stack.Navigator initialRouteName='Permissions'>
				<Stack.Screen name='Permissions' options={{ headerShown: false }} component={Permissions} />
				<Stack.Screen name='CreateWalletWelcome' options={{ headerShown: false }} component={CreateWalletWelcome} />
				<Stack.Screen name='WalletNew' options={{ headerTitle: 'Create' }} component={CreateWalletNew} />
				<Stack.Screen name='WalletMnemonic' options={{ headerTitle: 'Create' }} component={CreateWalletMnemonic} />
				<Stack.Screen name='WalletImport' options={{ headerTitle: 'Import' }} component={CreateWalletImport} />
				<Stack.Screen name='WalletImportSeed' options={{ headerTitle: 'Seed' }} component={CreateWalletImportSeed} />
				<Stack.Screen name='WalletImportMnemonic' options={{ headerTitle: 'Recovery phrase' }} component={CreateWalletImportMnemonic} />
			</Stack.Navigator>
		);
	}

}

export default class MainNavigator extends PureComponent<any, any> {

	render = () => {
		return (
			<Stack.Navigator initialRouteName='AuthLoading' screenOptions={{ headerShown: false, animation: 'none' }}>
				<Stack.Screen name='Login' component={LoginScreen} />
				<Stack.Screen name='AuthLoading' component={AuthLoadingScreen} />
				<Stack.Screen name='Auth' component={AuthNavigator} />
				<Stack.Screen name='Home' component={HomeScreen} />
				<Stack.Screen name='CreateWallet' component={CreateWalletNavigator} />
			</Stack.Navigator>
		);
	}

}
