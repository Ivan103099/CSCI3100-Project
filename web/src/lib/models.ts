export type TxnType = "income" | "expense";

export type Account = {
	id: number;
	gid: number;
	email: string;
	fullname: string;
};

export type Category = {
	id: string;
	name: string;
	type: TxnType;
};

export type Transaction = {
	id: string;
	cid: string;
	title: string;
	note?: string;
	amount: number;
	time: number;
};

export type AccountSummary = {
	income: number;
	expense: number;
	balance: number;
};
