import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { useAtomValue } from "jotai";
import { Provider } from "urql";

import { $authed } from "@/lib/client";
import { createClient } from "@/lib/graphql";

import Toast from "@/components/Toast";
import { AuthLayout, AuthLoginPage, AuthRegisterPage } from "./pages/auth";
import {
	AppLayout,
	AppDashboardPage,
	AppBudgetsPage,
	AppTransactionsPage,
	AppCategoriesPage,
} from "./pages/app";

const App = () => {
	const authed = useAtomValue($authed);

	// biome-ignore lint/correctness/useExhaustiveDependencies: recreate client when auth state changes
	const client = React.useMemo(() => createClient(), [authed]);

	return (
		<>
			<Toast />
			<Provider value={client}>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index element={<AppDashboardPage />} />
						<Route path="transactions" element={<AppTransactionsPage />} />
						<Route path="budgets" element={<AppBudgetsPage />} />
						<Route path="categories" element={<AppCategoriesPage />} />
					</Route>
					<Route element={<AuthLayout />}>
						<Route path="login" element={<AuthLoginPage />} />
						<Route path="register" element={<AuthRegisterPage />} />
					</Route>
				</Routes>
			</Provider>
		</>
	);
};

const body = document.querySelector("body");

// biome-ignore lint/style/noNonNullAssertion: must exist
createRoot(body!).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>,
);
