import React from "react";
import { createRoot } from "react-dom/client";
import {
	HashRouter,
	Routes,
	Route,
	useNavigate,
	useHref,
	type NavigateOptions,
} from "react-router";
import { useAtomValue } from "jotai";
import { Provider } from "urql";
import { RouterProvider } from "react-aria-components";

import { $authed } from "@/lib/client";
import { createClient } from "@/lib/graphql";

import Toast from "./components/Toast";
import { AuthLayout, AuthLoginPage, AuthRegisterPage } from "./pages/auth";
import { AppLayout, AppDashboardPage, AppCategoriesPage } from "./pages/app";

declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NavigateOptions;
	}
}

const App = () => {
	const navigate = useNavigate();
	const authed = useAtomValue($authed);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	const client = React.useMemo(() => createClient(), [authed]);

	return (
		<>
			<Toast />
			<Provider value={client}>
				<RouterProvider navigate={navigate} useHref={useHref}>
					<Routes>
						<Route element={<AppLayout />}>
							<Route index element={<AppDashboardPage />} />
							<Route path="transactions" />
							<Route path="budgets" />
							<Route path="categories" element={<AppCategoriesPage />} />
						</Route>
						<Route element={<AuthLayout />}>
							<Route path="login" element={<AuthLoginPage />} />
							<Route path="register" element={<AuthRegisterPage />} />
						</Route>
					</Routes>
				</RouterProvider>
			</Provider>
		</>
	);
};

const body = document.querySelector("body");

// biome-ignore lint/style/noNonNullAssertion: must exist
createRoot(body!).render(
	<React.StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</React.StrictMode>,
);
