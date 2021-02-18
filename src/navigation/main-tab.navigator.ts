import { createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/home/home.screen';

const HomeStack = createStackNavigator(
	{
		Home: HomeScreen,
	}, {
		initialRouteName: 'Home',
	}
);

export default HomeStack;
