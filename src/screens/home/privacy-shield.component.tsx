import React from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';

import NalliLogo from '../../components/svg/nalli-logo';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import AuthStore from '../../service/auth-store';
import ClientService from '../../service/client.service';
import ContactsService from '../../service/contacts.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WsService from '../../service/ws.service';

export enum NalliAppState {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

interface PrivacyShieldProps extends NavigationInjectedProps {
	onAppStateChange: (state: NalliAppState) => any;
}

interface PrivacyShieldState {
	appState: NalliAppState;
	sessionExpiresTime: string;
	inactivationTime: string;
}

class PrivacyShield extends React.PureComponent<PrivacyShieldProps, PrivacyShieldState> {

	constructor(props) {
		super(props);
		this.state = {
			appState: NalliAppState.ACTIVE,
			sessionExpiresTime: undefined,
			inactivationTime: undefined,
		};
	}

	componentDidMount = () => {
		this.init();
	}

	componentWillUnmount = () => {
		try {
			AppState.removeEventListener('change', this.handleAppChangeState);
		} catch {
			// nothing
		}
	}

	init = () => {
		AppState.addEventListener('change', this.handleAppChangeState);
	}

	handleAppChangeState = async (nextAppState) => {
		const disabled = await VariableStore.getVariable(NalliVariable.DISABLE_PRIVACY_SHIELD, false);
		if (disabled && this.state.appState == NalliAppState.ACTIVE) {
			return;
		}

		if (this.state.appState == NalliAppState.INACTIVE && nextAppState == 'active') {
			if (new Date(this.state.sessionExpiresTime).getTime() < new Date().getTime()) {
				await AuthStore.clearAuthentication();
				AuthStore.clearExpires();
				this.props.navigation.navigate('Login');
			} else if (new Date(this.state.inactivationTime) < new Date(new Date().getTime() - 60000)) {
				ClientService.refresh();
			}

			await ContactsService.refreshCache();
			VariableStore.setVariable(NalliVariable.APP_STATE, NalliAppState.ACTIVE);
			this.props.onAppStateChange(NalliAppState.ACTIVE);
			this.setState({ appState: NalliAppState.ACTIVE, sessionExpiresTime: '', inactivationTime: '' });
		} else if (this.state.appState == NalliAppState.ACTIVE
				&& nextAppState.match(/inactive|background/)) {
			WsService.unsubscribe();
			VariableStore.setVariable(NalliVariable.APP_STATE, NalliAppState.INACTIVE);
			this.props.onAppStateChange(NalliAppState.INACTIVE);
			const expiresTime = await AuthStore.getExpires();
			this.setState({ appState: NalliAppState.INACTIVE, sessionExpiresTime: expiresTime, inactivationTime: new Date().toISOString() });
		}
	}

	render = () => {
		const { children } = this.props;
		const { appState } = this.state;
 		return (
			<View style={styles.container}>
				{appState == NalliAppState.INACTIVE &&
					<View style={styles.inactiveOverlay}>
						<NalliLogo width={200} height={80} color='white' />
					</View>
				}
				{children}
			</View>
		);
	}

}

export default withNavigation(PrivacyShield);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		height: layout.window.height,
	},
	inactiveOverlay: {
		height: '100%',
		backgroundColor: Colors.main,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
