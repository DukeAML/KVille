import { configureStore } from '@reduxjs/toolkit';
//import storage from "redux-persist/lib/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

import userReducer from '../reducers/userSlice';

const reducers = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  //devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk],
});

export const persistor = persistStore(store);
