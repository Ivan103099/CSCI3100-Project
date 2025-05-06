// TODO: generate these types from GraphQL schema

export enum CategoryType {
	EXPENSE = "EXPENSE",
	INCOME = "INCOME",
}

export type Account = {
	id: number;
	gid: number;
	email: string;
	fullname: string;
};

export type Category = {
	id: string;
	name: string;
	type: CategoryType;
	emoji: string;
	color: string;
};

export type Transaction = {
	id: string;
	cid: string;
	title: string;
	amount: number;
	timestamp: number;
};

export type AccountSummary = {
	income: number;
	expense: number;
	balance: number;
};
