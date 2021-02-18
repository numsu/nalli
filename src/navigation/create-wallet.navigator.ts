import { createStackNavigator } from 'react-navigation';

import CreateWalletWelcome from '../screens/create-wallet/create-wallet-welcome.screen';
import CreateWalletMnemonic from '../screens/create-wallet/create/create-wallet-mnemonic.screen';
import CreateWalletNew from '../screens/create-wallet/create/create-wallet-new.screen';
import CreateWalletImportMnemonic from '../screens/create-wallet/import/create-wallet-import-mnemonic.screen';
import CreateWalletImportSeed from '../screens/create-wallet/import/create-wallet-import-seed.screen';
import CreateWalletImport from '../screens/create-wallet/import/create-wallet-import.screen';
import Permissions from '../screens/create-wallet/permissions.screen';

const CreateWallet = createStackNavigator(
	{
		Permissions: Permissions,
		CreateWalletWelcome: CreateWalletWelcome,
		WalletNew: CreateWalletNew,
		WalletMnemonic: CreateWalletMnemonic,
		WalletImport: CreateWalletImport,
		WalletImportSeed: CreateWalletImportSeed,
		WalletImportMnemonic: CreateWalletImportMnemonic,
	}, {
		initialRouteName: 'Permissions',
	},
);

export default CreateWallet;
