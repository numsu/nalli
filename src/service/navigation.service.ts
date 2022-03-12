import { StackActions, createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export default class NavigationService {

	static navigate = (routeName: string, params?: object) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch(StackActions.replace(routeName, params));
		}
	}

}
