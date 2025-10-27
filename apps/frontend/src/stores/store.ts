import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from '@/stores/utils/storage';
import proposalReducer from "@/stores/slices/proposal.slice";
import projectReducer from "@/stores/slices/project.slice";
import teamReducer from "@/stores/slices/team.slice";
import userReducer from "@/stores/slices/user.slice";

const persistProposalConfig = {
  key: 'proposals',
  storage,
};

const persistProjectConfig = {
  key: 'projects',
  storage,
};

const persistTeamConfig = {
  key: 'teams',
  storage,
};

const persistUserConfig = {
  key: 'user',
  storage,
};

const persistedProposalReducer = persistReducer(persistProposalConfig, proposalReducer);

const persistedProjectReducer = persistReducer(persistProjectConfig, projectReducer);

const persistedTeamReducer = persistReducer(persistTeamConfig, teamReducer);

const persistedUserReducer = persistReducer(persistUserConfig, userReducer);

export const store = configureStore({
  reducer: {
    proposals: persistedProposalReducer,
    projects: persistedProjectReducer,
    teams: persistedTeamReducer,
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export the store and types for use in the application
export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;