import React, { RefObject } from 'react';
import {
	FlatList,
	StyleSheet,
	Text,
} from 'react-native';

import Contact from '../../components/contact.component';
import NalliModal from '../../components/modal.component';
import NalliInput from '../../components/nalli-input.component';
import Colors from '../../constants/colors';

interface ContactsModalProps {
	isOpen: boolean;
	contacts: any[];
	onSelectContact: (contact: any) => Promise<any>;
}

interface ContactsModalState {
	filtered: any[];
	isOpen: boolean;
	process: boolean;
}

export default class ContactsModal extends React.Component<ContactsModalProps, ContactsModalState> {

	contactsSearchRef: RefObject<any>;

	constructor(props) {
		super(props);
		this.contactsSearchRef = React.createRef();
		this.state = {
			filtered: [],
			isOpen: props.isOpen,
			process: false,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	filterContacts = (value) => {
		if (value.trim().length > 2) {
			this.setState({
				filtered: this.props.contacts.filter(contact => (
					contact.name.toUpperCase().indexOf(value.trim().toUpperCase()) > -1
				))
			});
		} else {
			this.setState({ filtered: [] });
		}
	}

	hide = () => {
		this.props.onSelectContact(undefined);
		this.setState({ process: false });
	}

	onSelectContact = async (contact) => {
		if (!this.state.process) {
			this.setState({ process: true });
			await this.props.onSelectContact(contact);
			this.setState({ process: false });
		}
	}

	render = () => {
		const { filtered, isOpen } = this.state;

		if (isOpen) {
			return (
				<NalliModal
						isOpen={isOpen}
						onClose={this.hide}
						header='Select contact'>
					<NalliInput
							reference={this.contactsSearchRef}
							placeholder="Search contacts..."
							keyboardType="default"
							onChangeText={val => this.filterContacts(val)} />
					<FlatList
							data={filtered}
							keyExtractor={item => item.id}
							ListEmptyComponent={() => (
								<Text style={styles.text}>Start writing a name to search contacts...</Text>
							)}
							renderItem={({ item }) => (
								<Contact
										contact={item}
										onSelectContact={(contact) => this.onSelectContact(contact)} />
							)} />
				</NalliModal>
			);
		} else {
			return (<></>);
		}
	}

}

const styles = StyleSheet.create({
	text: {
		textAlign: 'center',
		alignSelf: 'center',
		fontFamily: 'OpenSans',
		fontSize: 16,
		color: Colors.darkText,
		marginTop: 30,
	},
});
