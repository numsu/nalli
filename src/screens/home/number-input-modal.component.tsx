import React from 'react';
import {
	Alert,
	StyleSheet,
	View,
} from 'react-native';

import NalliModal, { EModalSize } from '../../components/modal.component';
import NalliButton from '../../components/nalli-button.component';
import PhoneNumberInput from '../../components/phone-number-input.component';
import Colors from '../../constants/colors';
import ContactsService, { FormattedNumber } from '../../service/contacts.service';

interface NumberInputModalProps {
	isOpen: boolean;
	onConfirmNumber: (number: FormattedNumber) => void;
}

interface NumberInputModalState {
	country: string;
	number: string;
	isOpen: boolean;
}

export default class PhoneNumberInputModal extends React.Component<NumberInputModalProps, NumberInputModalState> {

	constructor(props) {
		super(props);
		this.state = {
			country: '',
			number: '',
			isOpen: props.isOpen,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	hide = () => {
		this.props.onConfirmNumber(undefined);
	}

	onChangeCountry = (country: string) => {
		this.setState({ country });
	}

	onChangeNumber = (number: string) => {
		this.setState({ number });
	}

	onConfirmNumber = (number: string) => {
		if (!ContactsService.isValidNumber(this.state.country, number)) {
			Alert.alert(
				'Invalid number',
				'The phone number you inserted is invalid.',
			);
			return;
		}
		this.props.onConfirmNumber(ContactsService.handleNumber(number, this.state.country));
	}

	render = () => {
		const { number, isOpen } = this.state;

		return (
			<NalliModal
					noScroll={true}
					isOpen={isOpen}
					onClose={this.hide}
					header='Phone number'
					size={EModalSize.MINI}>
				<View>
					<PhoneNumberInput
							value={number}
							onChangeNumber={this.onChangeNumber}
							onChangeCountry={this.onChangeCountry}
							countryInputContainerStyle={styles.input}
							countryTextInputStyle={styles.input}
							countryInputTextStyle={styles.countryInputText} />
					<NalliButton
							text='Confirm'
							solid={true}
							onPress={() => this.onConfirmNumber(number)} />
				</View>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	input: {
		borderColor: Colors.main,
		color: Colors.main,
		borderWidth: 1,
		marginBottom: 20,
	},
	countryInputText: {
		color: Colors.main,
	},
});
