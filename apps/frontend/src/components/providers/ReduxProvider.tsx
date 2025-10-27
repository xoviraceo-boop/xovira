'use client';
import { PersistGate } from 'redux-persist/integration/react';
import store from '@/stores/store';
import { Provider } from 'react-redux';
import persistStore from 'redux-persist/es/persistStore';

const persistor = persistStore(store);

export const ReduxProvider = ({ children }) => {
    return (
      <Provider store={ store }>
        <PersistGate persistor={ persistor }>
            { children }
        </PersistGate>
      </Provider>
    );
};
