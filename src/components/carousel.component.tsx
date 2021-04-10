import React from 'react';
import { EmitterSubscription, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import Colors from '../constants/colors';
import layout from '../constants/layout';
import CarouselCard from '../screens/home/carousel-card.component';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletHandler, { NalliAccount } from '../service/wallet-handler.service';
import Card from './card.component';

interface CarouselProps {
	price: number;
	onChangeAccount: (index: number) => void;
	onAddNewAccount: (index: number) => Promise<boolean>;
	onHideAccount: (index: number) => Promise<boolean>;
}

interface CarouselState {
	activeAccountsLength: number;
	accounts: NalliAccount[];
	activeAccount: number;
	processing: boolean;
}

export default class NalliCarousel extends React.Component<CarouselProps, CarouselState> {

	carouselRef;
	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			activeAccountsLength: 0,
			accounts: undefined,
			activeAccount: 0,
			processing: false,
		};
	}

	componentDidMount = () => {
		WalletHandler.getAccountsBalancesAndHandlePending();
		this.subscriptions.push(VariableStore.watchVariable<NalliAccount[]>(NalliVariable.ACCOUNTS_BALANCES, accounts => {
			const accountsLength = accounts.length;
			if (accountsLength < 6) {
				// Add the new account option
				accounts.push({} as NalliAccount);
			}
			this.setState({ accounts, activeAccountsLength: accountsLength }, async () => {
				const index = await VariableStore.getVariable<number>(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
				setTimeout(() => this.carouselRef.snapToItem(index, false, false), 250);
				this.setState({ activeAccount: index });
			});
		}));
		this.subscriptions.push(VariableStore.watchVariable<boolean>(NalliVariable.PROCESSING_PENDING, processing => {
			this.setState({ processing });
		}));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	changeAccount = (index: number) => {
		this.props.onChangeAccount(index);
		this.setState({ activeAccount: index });
	}

	hideAccount = async (index: number) => {
		if (await this.props.onHideAccount(index)) {
			this.carouselRef.snapToPrev();
			this.setState({ activeAccount: index - 1 });
		}
	}

	render = () => {
		const { price, onAddNewAccount } = this.props;
		const { activeAccountsLength, accounts, activeAccount, processing } = this.state;
		if (accounts) {
			return (
				<View>
					<Carousel
							ref={c => this.carouselRef = c}
							layout={'default'}
							sliderWidth={layout.window.width}
							itemWidth={layout.window.width - 40}
							activeSlideAlignment={'start'}
							containerCustomStyle={styles.carouselContainer}
							onSnapToItem={this.changeAccount}
							data={accounts}
							renderItem={(data: { item: NalliAccount; index: number }) => (
								<TouchableHighlight style={{ marginLeft: 3 }}>
									<CarouselCard
											balance={data.item.balance}
											price={price}
											accountActive={data.item.active}
											showAddAccountView={data.index == activeAccountsLength}
											isLastAccount={data.index !== 0 && data.index == activeAccountsLength - 1}
											accountIndex={data.index}
											processing={processing}
											onHideAccount={this.hideAccount}
											onAddNewAccount={onAddNewAccount} />
								</TouchableHighlight>
							)} />
					<Pagination
							carouselRef={this.carouselRef}
							dotsLength={accounts.length}
							activeDotIndex={activeAccount} />
				</View>
			);
		} else {
			return (
				<View style={styles.carouselContainer}>
					<Card title={'Account balance'} style={styles.loadingCard}>
						<Text style={styles.loadingText}>...</Text>
					</Card>
				</View>
			);
		}
	}

}

const styles = StyleSheet.create({
	carouselContainer: {
		paddingHorizontal: 20,
		paddingTop: 20,
		marginBottom: -20,
		marginLeft: -3,
	},
	loadingCard: {
		marginTop: 10,
		marginBottom: 10,
		marginLeft: 3,
		marginRight: 3,
	},
	loadingText: {
		color: Colors.main,
		fontSize: 40,
		fontFamily: 'OpenSans',
	},
});