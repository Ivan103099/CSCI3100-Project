import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	HashRouter,
	Routes,
	Route,
	useNavigate,
	useHref,
	type NavigateOptions,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-aria-components";

import { client } from "@/lib/client";

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
	return (
		<>
			<Toast />
			<QueryClientProvider client={client}>
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
			</QueryClientProvider>
		</>
	);
};

const body = document.querySelector("body");

// biome-ignore lint/style/noNonNullAssertion: must exist
createRoot(body!).render(
	<StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</StrictMode>,
);
