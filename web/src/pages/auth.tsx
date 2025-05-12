import { useAtomValue } from "jotai";
import { Navigate, Outlet } from "react-router";

import { $authed } from "@/lib/client";

export { default as AuthLoginPage } from "./auth/login";
export { default as AuthRegisterPage } from "./auth/register";

export function AuthLayout() {
	const authed = useAtomValue($authed);
	if (authed) return <Navigate to="/" />;
	return (
		<div className="flex justify-center items-center h-full bg-gray-50">
			<Outlet />
		</div>
	);
}
