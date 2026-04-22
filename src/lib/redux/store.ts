import { configureStore } from "@reduxjs/toolkit";
import { transactionsApi } from "@/features/transactions/api/transactionsApi";
import { budgetsApi } from "@/features/budgets/api/budgetsApi";
import { goalsApi } from "@/features/goals/api/goalsApi";
import { settingsApi } from "@/features/settings/api/settingsApi";
import { walletsApi } from "@/features/wallets/api/walletsApi";
import { loansApi } from "@/features/loans/api/loansApi";

export const store = configureStore({
  reducer: {
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [budgetsApi.reducerPath]: budgetsApi.reducer,
    [goalsApi.reducerPath]: goalsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [walletsApi.reducerPath]: walletsApi.reducer,
    [loansApi.reducerPath]: loansApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      transactionsApi.middleware,
      budgetsApi.middleware,
      goalsApi.middleware,
      settingsApi.middleware,
      walletsApi.middleware,
      loansApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
