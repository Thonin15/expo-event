import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InitialState = {
	authenticated: false,
	uid: null,
	userInfo: null,
};

const useAuthStore = create()(
	persist(
		(set) => ({
			...InitialState,
			setAuthentication: (payload) => set(() => payload),
			updateUserInfo: (payload) =>
				set((state) => ({
					userInfo: { ...state.userInfo, ...payload },
				})),
			clearAuth: () => {
				set(() => InitialState);
			},
		}),
		{ name: 'authStore', storage: createJSONStorage(() => AsyncStorage) }
	)
);

export default useAuthStore;
