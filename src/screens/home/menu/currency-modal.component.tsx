import { PureComponent } from 'react';
import {
	FlatList,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import NalliModal from '../../../components/modal.component';
import NalliText, { ETextSize } from '../../../components/text.component';
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

export default class CurrencyModal extends PureComponent<CurrencyModalProps, CurrencyModalState> {

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

		return (
			<NalliModal
					noScroll
					isOpen={isOpen}
					onClose={close}
					linearGradientTopStyle={{ height: 20, top: 70 }}
					linearGradientTopStart={0}
					header='Select currency'>
				<FlatList
						data={currencies}
						keyExtractor={item => item.iso}
						initialNumToRender={10}
						removeClippedSubviews
						renderItem={({ item }) => (
							<TouchableOpacity onPress={() => this.selectCurrency(item)}>
								<View style={styles.currencyItem}>
									<NalliText size={ETextSize.P_LARGE} style={styles.currencyIcon}>{item.icon}</NalliText>
									<NalliText style={styles.currencyText}>{item.name} ({item.iso})</NalliText>
								</View>
							</TouchableOpacity>
						)} />
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	currencyItem: {
		flexDirection: 'row',
		paddingVertical: 10,
		borderBottomColor: Colors.borderColor,
		borderBottomWidth: 1,
	},
	currencyIcon: {
		color: Colors.main,
		width: 60,
		lineHeight: 30,
	},
	currencyText: {
		lineHeight: 30,
	},
});
