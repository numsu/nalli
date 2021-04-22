import React, { RefObject } from 'react';
import {
	FlatList,
	StyleSheet,
} from 'react-native';

import Contact from '../../components/contact.component';
import NalliModal, { EModalSize } from '../../components/modal.component';
import NalliInput from '../../components/nalli-input.component';
import NalliText from '../../components/text.component';
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

	componentDidMount = () => {
		this.filterContacts();
	}

	static getDerivedStateFromProps(nextProps: ContactsModalProps, prevState: ContactsModalState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen, filtered: nextProps.contacts };
		}
		return null;
	}

	filterContacts = (value?) => {
		if (value) {
			this.setState({
				filtered: this.props.contacts.filter(contact => (
					contact.name.toUpperCase().indexOf(value.trim().toUpperCase()) > -1
				))
			});
		} else {
			this.setState({
				filtered: [ ...this.props.contacts ]
			});
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
						size={EModalSize.LARGE}
						isOpen={isOpen}
						onClose={this.hide}
						header='Select contact'
						noScroll={true}>
					<NalliInput
							reference={this.contactsSearchRef}
							placeholder="Search..."
							keyboardType="default"
							onChangeText={this.filterContacts} />
					<FlatList
							style={{ height: '100%' }}
							contentContainerStyle={{ paddingBottom: 40 }}
							data={filtered}
							keyExtractor={item => item.id}
							ListEmptyComponent={() => (
								<NalliText style={styles.text}>No contacts</NalliText>
							)}
							renderItem={({ item }) => (
								<Contact
										contact={item}
										onSelectContact={this.onSelectContact} />
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
		color: Colors.darkText,
		marginTop: 30,
	},
});
