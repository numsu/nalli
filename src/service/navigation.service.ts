import { CommonActions, createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export default class NavigationService {

	static navigate = (name: string, params?: object) => {
		if (navigationRef.isReady()) {
			navigationRef.dispatch(CommonActions.reset({
				index: 0,
				key: null,
				routes: [{ name, params }],
			}));
		}
	}

}
