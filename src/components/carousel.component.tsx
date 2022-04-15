import { PureComponent } from 'react';
import { EmitterSubscription, StyleSheet, TouchableHighlight, View } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import layout from '../constants/layout';
import CarouselCard from '../screens/home/carousel-card.component';
import AuthStore from '../service/auth-store';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletHandler, { NalliAccount } from '../service/wallet-handler.service';

interface CarouselProps {
	price: number;
	onChangeAccount: (index: number) => void;
	onAddNewAccount: (index: number) => Promise<boolean>;
	onHideAccount: (index: number) => Promise<boolean>;
}

interface CarouselState {
	accounts: NalliAccount[];
	activeAccount: number;
	activeAccountsLength: number;
	isPhoneNumberUser: boolean;
	processing: boolean;
}

export default class NalliCarousel extends PureComponent<CarouselProps, CarouselState> {

	carouselRef;
	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			accounts: [],
			activeAccount: 0,
			activeAccountsLength: 0,
			isPhoneNumberUser: false,
			processing: false,
		};
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		this.subscriptions.push(VariableStore.watchVariable<NalliAccount[]>(NalliVariable.ACCOUNTS_BALANCES, accounts => {
			const accountsLength = accounts.length;
			if (accountsLength < 6) {
				// Add the new account option
				accounts.push({} as NalliAccount);
			}
			this.setState({ accounts, activeAccountsLength: accountsLength }, async () => {
				const index = await VariableStore.getVariable<number>(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
				setTimeout(() => this.carouselRef?.snapToItem(index, false, false), 250);
				this.setState({ activeAccount: index });
			});
		}));
		this.subscriptions.push(VariableStore.watchVariable<boolean>(NalliVariable.PROCESSING_PENDING, processing => {
			this.setState({ processing });
		}));
		WalletHandler.getAccountsBalancesAndHandlePending();
		const isPhoneNumberUser = await AuthStore.isPhoneNumberFunctionsEnabled();
		this.setState({ isPhoneNumberUser });
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
		const {
			accounts,
			activeAccount,
			activeAccountsLength,
			isPhoneNumberUser,
			processing,
		} = this.state;

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
						shouldOptimizeUpdates
						enableSnap
						enableMomentum
						initialNumToRender={1}
						lockScrollWhileSnapping={false}
						data={accounts}
						renderItem={(data: { item: NalliAccount; index: number }) => (
							<TouchableHighlight style={{ marginLeft: 3 }}>
								<CarouselCard
										balance={data.item.balance}
										price={price}
										isPhoneNumberUser={isPhoneNumberUser}
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
						containerStyle={{ marginTop: -13 }}
						carouselRef={this.carouselRef}
						dotsLength={accounts.length}
						activeDotIndex={activeAccount} />
			</View>
		);
	}

}

const styles = StyleSheet.create({
	carouselContainer: {
		paddingHorizontal: 20,
		paddingTop: 18,
		marginBottom: -20,
	},
});