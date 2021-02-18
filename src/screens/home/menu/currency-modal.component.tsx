import React from 'react';
import {
	FlatList,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Text } from 'react-native-elements';

import NalliModal from '../../../components/modal.component';
import Colors from '../../../constants/colors';
import { Currency, currencyList } from '../../../service/currency.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';

interface CurrencyModalProps {
	isOpen: boolean;
	close: () => void;
}

interface CurrencyModalState {
	isOpen: boolean;
}

export default class CurrencyModal extends React.Component<CurrencyModalProps, CurrencyModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	selectCurrency = async (currency: Currency) => {
		await VariableStore.setVariable(NalliVariable.CURRENCY, currency.iso.toLowerCase());
		this.props.close();
	}

	render = () => {
		const { close } = this.props;
		const { isOpen } = this.state;

		const currencies = currencyList.sort((a, b) => a.name.localeCompare(b.name));

		if (isOpen) {
			return (
				<NalliModal
						isOpen={isOpen}
						onClose={close}
						header='Select currency'>
					<FlatList
							data={currencies}
							keyExtractor={item => item.iso}
							renderItem={({ item }) => (
								<TouchableOpacity onPress={() => this.selectCurrency(item)}>
									<View style={styles.currencyItem}>
										<Text style={styles.currencyIcon}>{item.icon}</Text>
										<Text style={styles.currencyText}>{item.name} ({item.iso})</Text>
									</View>
								</TouchableOpacity>
							)} />
				</NalliModal>
			);
		} else {
			return (<></>);
		}
	}

}

const styles = StyleSheet.create({
	currencyItem: {
		flexDirection: 'row',
		paddingVertical: 20,
		borderBottomColor: Colors.borderColor,
		borderBottomWidth: 1,
	},
	currencyIcon: {
		fontFamily: 'OpenSansBold',
		color: Colors.main,
		width: 60,
		fontSize: 20,
		lineHeight: 30,
	},
	currencyText: {
		fontFamily: 'OpenSans',
		fontSize: 15,
		lineHeight: 30,
	},
});
