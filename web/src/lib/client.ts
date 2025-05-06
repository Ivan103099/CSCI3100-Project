import { atom, useSetAtom } from "jotai";

import type { Account } from "./models";
import { createClient } from "./graphql";

export const BASE_URL = "http://localhost:6969/api/";

export const $account = atom<Account | undefined>(undefined);
export const $authed = atom<boolean>((get) => get($account) !== undefined);

type RequestParams = {
	endpoint: string;
	method?: string;
	body?: unknown;
	query?: URLSearchParams;
};

const request = async <R = undefined>(
	params: RequestParams,
): Promise<R | undefined> => {
	const url = new URL(params.endpoint, BASE_URL);
	url.search = params.query?.toString() ?? "";

	const response = await fetch(url, {
		credentials: "include",
		method: params.method ?? "GET",
		body: params.body ? JSON.stringify(params.body) : null,
		headers: params.body
			? {
					"Content-Type": "application/json",
				}
			: undefined,
	});

	const contentType = response.headers.get("content-type") ?? "";

	if (!response.ok) {
		if (contentType.startsWith("text/plain")) {
			throw new Error(`${await response.text()} (${response.status})`);
		}
		throw new Error(response.statusText || response.status.toString());
	}
	if (!contentType) {
		return undefined;
	}
	return (await response.json()) as R;
};

export const useLoginRequest = () => {
	const setAccount = useSetAtom($account);
	return (data: { email: string; password: string }) =>
		request<Account>({
			endpoint: "auth/login",
			method: "POST",
			body: data,
		}).then((res) => {
			setAccount(res as Account);
			return res;
		});
};

export const useLogoutRequest = () => {
	const setAccount = useSetAtom($account);
	return () =>
		request({
			endpoint: "auth/logout",
			method: "POST",
		}).then(() => {
			createClient();
			setAccount(undefined);
		});
};
