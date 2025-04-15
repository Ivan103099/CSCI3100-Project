import { atom, getDefaultStore } from "jotai";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

const BASE_URL = "http://localhost:6969/api/";

const store = getDefaultStore();

export const client = new QueryClient();

export type Account = {
	id: number;
	gid: number;
	email: string;
	fullname: string;
};

export type Category = {
	id: string;
	name: string;
	type: "expense" | "income";
};

export type Transaction = {
	id: string;
	cid: string;
	title: string;
	note?: string;
	amount: number;
	time: number;
};

export type Summary = {
	income: number;
	expense: number;
	balance: number;
};

export const $account = atom<Account | undefined>(undefined);

export const $authed = atom<boolean>((get) => get($account) !== undefined);

type RequestParams = {
	endpoint: string;
	method?: string;
	body?: unknown;
	query?: URLSearchParams;
};

const request = async (params: RequestParams) => {
	const url = new URL(params.endpoint, BASE_URL);
	url.search = params.query?.toString() ?? "";

	const response = await fetch(url, {
		credentials: "include",
		method: params.method || "GET",
		body: params.body ? JSON.stringify(params.body) : null,
		headers: params.body
			? {
					"Content-Type": "application/json",
				}
			: undefined,
	});

	const ct = response.headers.get("content-type") ?? "";

	if (!response.ok) {
		if (ct.startsWith("text/plain")) {
			throw new Error(`${response.status} ${await response.text()}`);
		}
		throw new Error(response.statusText || response.status.toString());
	}
	if (!ct) {
		return undefined;
	}
	if (ct.startsWith("text/plain")) {
		return await response.text();
	}
	return await response.json();
};

export const useLoginMutation = () =>
	useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			request({
				endpoint: "auth/login",
				method: "POST",
				body: data,
			}),
		onSuccess: (data) => store.set($account, data),
	});

export const useRegisterMutation = () =>
	useMutation({
		mutationFn: (data: {
			email: string;
			fullname: string;
			password: string;
		}) =>
			request({
				endpoint: "auth/register",
				method: "POST",
				body: data,
			}),
	});

export const useLogoutMutation = () =>
	useMutation({
		mutationFn: () =>
			request({
				endpoint: "auth/logout",
				method: "POST",
			}),
		onSuccess: () => store.set($account, undefined),
	});

export const useCreateTransactionMutation = () => {
	return useMutation({
		mutationFn: (data: {
			title: string;
			note?: string;
			amount: number;
			time: Date;
			cid: string;
		}) =>
			request({
				endpoint: "transactions",
				method: "POST",
				body: { ...data, time: data.time.toISOString() },
			}),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["summary"] });
			client.invalidateQueries({ queryKey: ["transactions"] });
		},
	});
};

export const useAccountQuery = () =>
	useQuery<Account>({
		queryKey: ["account"],
		queryFn: () =>
			request({ endpoint: "auth/account" })
				.then((data) => {
					store.set($account, data);
					return data;
				})
				.catch((error) => {
					store.set($account, undefined);
					throw error;
				}),
		retry: false,
		staleTime: 1000,
	});

export const useSummaryQuery = () =>
	useQuery<Summary>({
		queryKey: ["summary"],
		queryFn: () => request({ endpoint: "summary" }),
		enabled: !!store.get($authed),
	});

export const useCategoriesQuery = () =>
	useQuery<Category[], unknown, { [id: Category["id"]]: Category }>({
		queryKey: ["categories"],
		queryFn: () => request({ endpoint: "categories" }),
		enabled: !!store.get($authed),
		staleTime: Number.POSITIVE_INFINITY,
		select: (data) =>
			data.reduce(
				(result, cat) => {
					result[cat.id] = cat;
					return result;
				},
				{} as { [id: Category["id"]]: Category },
			),
	});

export const useTransactionsQuery = () =>
	useQuery<Transaction[]>({
		queryKey: ["transactions"],
		queryFn: () => request({ endpoint: "transactions" }),
		enabled: !!store.get($authed),
	});
