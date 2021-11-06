import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from '../screens/home/home.screen';

const HomeStack = createStackNavigator(
	{
		Home: HomeScreen,
	}, {
		initialRouteName: 'Home',
	}
);

export default HomeStack;
