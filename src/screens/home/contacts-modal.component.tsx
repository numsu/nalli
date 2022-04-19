import React, { RefObject } from 'react';
import { EmitterSubscription, View } from 'react-native';
import {
	FlatList,
	StyleSheet,
} from 'react-native';

import Contact from '../../components/contact.component';
import NalliModal, { EModalSize } from '../../components/modal.component';
import NalliInput from '../../components/nalli-input.component';
import NalliText from '../../components/text.component';
import Colors from '../../constants/colors';
import ContactsService, { ContactItem } from '../../service/contacts.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';

interface ContactsModalProps {
	isOpen: boolean;
	onlyNalliUsers?: boolean;
	onSelectContact: (contact: any) => Promise<any>;
}

interface ContactsModalState {
	contacts: ContactItem[];
	filtered: any[];
	isOpen: boolean;
	onlyNalliUsers: boolean
	process: boolean;
}

export default class ContactsModal extends React.PureComponent<ContactsModalProps, ContactsModalState> {

	contactsSearchRef: RefObject<any>;
	subscriptions = [] as EmitterSubscription[];

	constructor(props) {
		super(props);
		this.contactsSearchRef = React.createRef();
		this.state = {
			contacts: [],
			filtered: [],
			isOpen: props.isOpen,
			onlyNalliUsers: this.props.onlyNalliUsers,
			process: false,
		};
	}

	componentDidMount = () => {
		this.subscriptions.push(VariableStore.watchVariable<boolean>(NalliVariable.ONLY_NALLI_USERS, async onlyNalliUsers => {
			await this.setOnlyNalliUsers(onlyNalliUsers);
			this.filterContacts();
		}));

		this.init();
	}

	componentWillUnmount() {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	componentDidUpdate() {
		if (this.state.isOpen) {
			ContactsService.getContacts(); // Check for permissions
		}
	}

	static getDerivedStateFromProps(nextProps: ContactsModalProps, prevState: ContactsModalState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	init = async () => {
		await this.fetchContacts();
		await this.setOnlyNalliUsers();
		this.filterContacts();
	}

	setOnlyNalliUsers = async (onlyNalliUsers?) => {
		return new Promise<void>(async resolve => {
			if (!this.props.onlyNalliUsers) {
				if (onlyNalliUsers === undefined) {
					onlyNalliUsers = await VariableStore.getVariable<boolean>(NalliVariable.ONLY_NALLI_USERS, false);
				}
				this.setState({ onlyNalliUsers }, resolve);
			}
			resolve();
		});
	}

	fetchContacts = async () => {
		return new Promise<void>(async resolve => {
			const contacts = await ContactsService.getContacts(false);
			this.setState({ contacts }, resolve);
		});
	}

	filterContacts = (value?) => {
		if (value) {
			this.setState({
				filtered: this.state.contacts.filter(contact => {
					if (this.state.onlyNalliUsers && !contact.isNalliUser) {
						return false;
					}
					return contact.name.toUpperCase().indexOf(value.trim().toUpperCase()) > -1;
				})
			});
		} else {
			if (this.state.onlyNalliUsers) {
				this.setState({
					filtered: this.state.contacts.filter(contact => contact.isNalliUser)
				});
			} else {
				this.setState({
					filtered: [ ...this.state.contacts ]
				});
			}
		}
	}

	hide = () => {
		this.props.onSelectContact(undefined);
		this.setState({ process: false });
	}

	onSelectContact = async (contact) => {
		if (!this.state.process) {
			this.setState({ process: true }, async () => {
				await this.props.onSelectContact(contact);
				this.setState({ process: false });
			});
		}
	}

	onOnlyNalliUsersChange = () => {
		this.setState({ onlyNalliUsers: !this.state.onlyNalliUsers });
	}

	render = () => {
		const {
			filtered,
			isOpen,
		} = this.state;

		return (
			<NalliModal
					size={EModalSize.LARGE}
					isOpen={isOpen}
					onClose={this.hide}
					header='Select contact'
					linearGradientTopStyle={{ height: 15, top: 109 }}
					linearGradientTopStart={0}
					headerContainerStyle={{ height: 100 }}
					headerComponent={
						<View style={{ width: '100%', backgroundColor: 'white', marginTop: 10 }}>
							<NalliInput
									style={{ width: '92%', height: 40, alignSelf: 'center' }}
									reference={this.contactsSearchRef}
									placeholder='Search...'
									keyboardType='default'
									onChangeText={this.filterContacts} />
						</View>
					}
					noScroll>
				<FlatList
						style={{ height: '100%' }}
						contentContainerStyle={{ paddingBottom: 40 }}
						data={filtered}
						keyExtractor={item => item.id}
						initialNumToRender={8}
						removeClippedSubviews
						ListHeaderComponent={() => (
							<View style={{ marginTop: 40 }}></View>
						)}
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
