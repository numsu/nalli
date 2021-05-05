import React from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import NalliLogo from '../../components/svg/nalli-logo';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import ContactsService from '../../service/contacts.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';

export enum NalliAppState {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

interface PrivacyShieldProps {
	onAppStateChange: (state: NalliAppState) => any;
}

interface PrivacyShieldState {
	appState: NalliAppState;
}

export default class PrivacyShield extends React.Component<PrivacyShieldProps, PrivacyShieldState> {

	constructor(props) {
		super(props);
		this.state = {
			appState: NalliAppState.ACTIVE,
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

	init = async () => {
		AppState.addEventListener('change', this.handleAppChangeState);
	}

	handleAppChangeState = (nextAppState) => {
		if (this.state.appState == 'inactive' && nextAppState == 'active') {
			VariableStore.setVariable(NalliVariable.APP_STATE, NalliAppState.ACTIVE);
			this.props.onAppStateChange(NalliAppState.ACTIVE);
			this.setState({ appState: NalliAppState.ACTIVE });
			ContactsService.clearCache();
		} else if (this.state.appState == NalliAppState.ACTIVE
				&& nextAppState.match(/inactive|background|suspended/)) {
			VariableStore.setVariable(NalliVariable.APP_STATE, NalliAppState.INACTIVE);
			this.props.onAppStateChange(NalliAppState.INACTIVE);
			this.setState({ appState: NalliAppState.INACTIVE });
		}
	}

	render = () => {
		const { children } = this.props;
		const { appState } = this.state;
 		return (
			<View style={styles.container}>
				{appState == NalliAppState.INACTIVE &&
					<View style={styles.inactiveOverlay}>
						<NalliLogo width={200} height={80} color="white" />
					</View>
				}
				{children}
			</View>
		);
	}

}

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
