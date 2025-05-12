import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import {
	now,
	getLocalTimeZone,
	type ZonedDateTime,
} from "@internationalized/date";
import { Pressable, Form } from "react-aria-components";
import {
	CreditCard,
	Home,
	LayoutGrid,
	LogOut,
	PiggyBank,
	Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CategoryType } from "@/lib/models";
import { $account, useLogoutRequest } from "@/lib/client";
import {
	useAccountQuery,
	useCategoriesQuery,
	useCreateTransactionMutation,
} from "@/lib/graphql";

import Button from "@/components/Button";
import Menu from "@/components/Menu";
import Modal from "@/components/Modal";
import TextField from "@/components/TextField";
import NumberField from "@/components/NumberField";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import { toasts } from "@/components/Toast";

export { default as AppDashboardPage } from "./app/index";
export { default as AppTransactionsPage } from "./app/transactions";
export { default as AppBudgetsPage } from "./app/budgets";
export { default as AppCategoriesPage } from "./app/categories";

const LINKS = [
	{
		title: "Dashboard",
		href: "/",
		Icon: Home,
	},
	{
		title: "Transactions",
		href: "/transactions",
		Icon: CreditCard,
	},
	{
		title: "Budgets",
		href: "/budgets",
		Icon: PiggyBank,
	},
	{
		title: "Categories",
		href: "/categories",
		Icon: LayoutGrid,
	},
];

type TransactionForm = {
	type: CategoryType;
	category: string;
	title: string;
	amount: number;
	datetime: ZonedDateTime;
};

const initTransactionForm = (): TransactionForm => ({
	type: CategoryType.EXPENSE,
	category: "",
	title: "",
	amount: 0,
	datetime: now(getLocalTimeZone()),
});

const TransactionModal = () => {
	const [form, setFormData] = React.useState(initTransactionForm());

	const [queryCategories] = useCategoriesQuery();
	const [, createTransaction] = useCreateTransactionMutation();

	const currentDateTime = React.useMemo(() => now(getLocalTimeZone()), []);

	const categories = React.useMemo(
		() =>
			(queryCategories.data?.categories ?? []).filter(
				(cat) => cat.type === form.type,
			),
		[queryCategories.data, form.type],
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		createTransaction(
			{
				title: form.title,
				amount: form.amount,
				timestamp: Math.floor(form.datetime.toDate().getTime() / 1000),
				cid: form.category,
			},
			{ additionalTypenames: ["AccountSummary"] },
		).then(({ error, data }) => {
			if (error)
				toasts.add(
					{
						title: "Transaction Create Failed",
						description: error.message,
						variant: "destructive",
					},
					{ timeout: 5000 },
				);
			else
				toasts.add(
					{
						title: "Transaction Created",
						description: data?.createTransaction.id ?? "",
						variant: "success",
					},
					{ timeout: 5000 },
				);
		});
	};

	return (
		<Modal>
			{({ close }) => (
				<>
					<Modal.Header className="mb-2">
						<Modal.Title>Create New Transaction</Modal.Title>
					</Modal.Header>
					<Form
						id="form"
						className="flex flex-col gap-4"
						onSubmit={(e) => {
							close();
							handleSubmit(e);
							setFormData(initTransactionForm());
						}}
					>
						<div className="grid grid-cols-8 gap-4">
							<NumberField
								className="col-span-3"
								label="Amount"
								autoFocus
								isRequired
								minValue={0}
								value={form.amount}
								onChange={(value) => setFormData({ ...form, amount: value })}
								formatOptions={{
									style: "currency",
									currency: "HKD",
									currencySign: "standard",
									currencyDisplay: "symbol",
								}}
							/>
							<Select
								className="col-span-2"
								label="Type"
								placeholder="Type"
								isRequired
								selectedKey={form.type}
								onSelectionChange={(key) =>
									setFormData({
										...form,
										category: "", // reset category when type changes
										type: key as CategoryType,
									})
								}
							>
								<Select.Item id={CategoryType.EXPENSE}>Expense</Select.Item>
								<Select.Item id={CategoryType.INCOME}>Income</Select.Item>
							</Select>
							<Select
								className="col-span-3"
								label="Category"
								placeholder="Category"
								isRequired
								selectedKey={form.category}
								onSelectionChange={(key) =>
									setFormData({ ...form, category: key.toString() })
								}
							>
								{categories.map((cat) => (
									<Select.Item key={cat.id} id={cat.id}>
										{cat.emoji}
										<span className="ml-1.5">{cat.name}</span>
									</Select.Item>
								))}
							</Select>
						</div>
						<div className="grid grid-cols-8 gap-4">
							<TextField
								className="col-span-4"
								label="Title"
								isRequired
								value={form.title}
								onChange={(value) => setFormData({ ...form, title: value })}
							/>
							<DatePicker
								className="col-span-4"
								label="Date Time"
								isRequired
								hideTimeZone
								granularity="minute"
								maxValue={currentDateTime}
								value={form.datetime}
								onChange={(value) => {
									if (value) setFormData({ ...form, datetime: value });
								}}
							/>
						</div>
					</Form>
					<Modal.Footer>
						<Button onPress={close} type="button" variant="outline">
							Cancel
						</Button>
						<Button type="submit" form="form">
							Add Transaction
						</Button>
					</Modal.Footer>
				</>
			)}
		</Modal>
	);
};

export function AppLayout() {
	const navigate = useNavigate();
	const location = useLocation();

	const setAccount = useSetAtom($account);

	const requestLogout = useLogoutRequest();
	const [queryAccount] = useAccountQuery();

	const account = React.useMemo(
		() => queryAccount.data?.account,
		[queryAccount.data],
	);

	const handleLogout = () => {
		requestLogout()
			.then(() => navigate("/login"))
			.catch(({ message }) =>
				toasts.add(
					{
						title: "Logout Failed",
						description: message,
						variant: "destructive",
					},
					{ timeout: 5000 },
				),
			);
	};

	React.useEffect(() => {
		// update account atom when account query is successful
		if (!queryAccount.fetching && !queryAccount.error)
			setAccount(queryAccount.data?.account);
	}, [queryAccount, setAccount]);

	if (queryAccount.fetching) return <></>;
	if (queryAccount.error) return <Navigate to="/login" />;
	return (
		<div className="flex flex-col">
			<header
				className={cn(
					"sticky top-0 z-10 py-2 px-5 flex items-center shadow-sm border-b border-border",
					"bg-gradient-to-r from-background via-background to-background/80 backdrop-blur",
				)}
			>
				<span className="text-lg font-bold font-display tracking-tight select-none">
					FINAWISE
				</span>
				<div className="flex ml-auto gap-4">
					<Modal.Trigger>
						<Button size="sm" variant="secondary">
							<Plus className="size-4" />
							New Transaction
						</Button>
						<TransactionModal />
					</Modal.Trigger>
					<Menu.Trigger>
						<Pressable>
							<button
								type="button"
								className="flex justify-center items-center bg-primary/10 rounded-[50%] size-9 select-none cursor-pointer"
							>
								{account?.fullname[0].toUpperCase()}
							</button>
						</Pressable>
						<Menu className="min-w-43">
							<Menu.Item className="flex flex-col items-start">
								<span className="text-sm font-medium leading-none">
									{account?.fullname}
								</span>
								<span className="text-xs text-muted-foreground leading-none">
									{account?.email}
								</span>
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item
								onAction={handleLogout}
								className="font-medium text-rose-500 focus:text-rose-500"
							>
								<LogOut className="size-4" />
								Logout
							</Menu.Item>
						</Menu>
					</Menu.Trigger>
				</div>
			</header>
			<div className="flex-1 flex">
				<aside className="sticky top-[3.3rem] h-[calc(100vh-3.3rem)] p-5 border-r border-border overflow-y-auto">
					<nav className="flex flex-col gap-2">
						{LINKS.map((link) => (
							<Button
								key={link.href}
								className="justify-start"
								variant={link.href === location.pathname ? "default" : "ghost"}
								onPress={() => navigate(link.href)}
							>
								<link.Icon className="mr-2 size-4" />
								{link.title}
							</Button>
						))}
					</nav>
				</aside>
				<Outlet />
			</div>
		</div>
	);
}
