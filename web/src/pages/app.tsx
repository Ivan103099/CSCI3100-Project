import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { getLocalTimeZone, startOfMonth, now } from "@internationalized/date";
import { Pressable, Form } from "react-aria-components";
import {
	CreditCard,
	Home,
	LayoutGrid,
	LogOut,
	PiggyBank,
	Plus,
} from "lucide-react";

import type { TxnType } from "@/lib/models";
import { $account, useLogoutRequest } from "@/lib/client";
import {
	useAccountQuery,
	useCategoriesQuery,
	useCreateTransactionMutation,
} from "@/lib/graphql";

import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import Menu from "@/components/Menu";
import Modal from "@/components/Modal";
import TextField from "@/components/TextField";
import NumberField from "@/components/NumberField";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import { toasts } from "@/components/Toast";

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

const TransactionModal = () => {
	const currentDateTime = React.useMemo(() => now(getLocalTimeZone()), []);

	const init = {
		type: "EXPENSE" as TxnType,
		category: "",
		title: "",
		datetime: currentDateTime,
		amount: 0,
	};
	const [form, setFormData] = React.useState(init);

	const [queryCategories] = useCategoriesQuery(form.type || undefined);
	const [, createTransaction] = useCreateTransactionMutation();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		createTransaction({
			title: form.title,
			amount: form.amount,
			timestamp: Math.floor(form.datetime.toDate().getTime() / 1000),
			cid: form.category,
		}).then(({ error, data }) => {
			if (error)
				toasts.add({
					title: "Transaction Create Failed",
					description: error.message,
					variant: "destructive",
				});
			else
				toasts.add({
					title: "Transaction Created",
					description: data?.createTransaction.id ?? "",
					variant: "success",
				});
		});
	};

	React.useEffect(() => {
		// reset category when type changes
		form.type && setFormData((d) => ({ ...d, category: "" }));
	}, [form.type]);

	return (
		<Modal.Overlay>
			<Modal.Content>
				{({ close }) => (
					<>
						<Modal.Header className="mb-2">
							<Modal.Title>Create New Transaction</Modal.Title>
							<Modal.Description className="text-sm text-muted-foreground">
								Fill in the details of your new transaction.
							</Modal.Description>
						</Modal.Header>
						<Form
							id="form"
							className="flex flex-col gap-4"
							onSubmit={(e) => {
								handleSubmit(e);
								setFormData(init);
								close();
							}}
						>
							<div className="grid grid-cols-8 gap-4">
								<NumberField
									autoFocus
									label="Amount"
									className="col-span-3"
									isRequired
									formatOptions={{
										style: "currency",
										currency: "HKD",
										currencySign: "standard",
										currencyDisplay: "symbol",
									}}
									minValue={0}
									value={form.amount}
									onChange={(value) =>
										value >= 0 && setFormData({ ...form, amount: value })
									}
								/>
								<Select
									label="Type"
									placeholder="Type"
									className="col-span-2"
									isRequired
									selectedKey={form.type}
									onSelectionChange={(key) =>
										setFormData({ ...form, type: key as TxnType })
									}
								>
									<Select.Item id="EXPENSE">Expense</Select.Item>
									<Select.Item id="INCOME">Income</Select.Item>
								</Select>
								<Select
									label="Category"
									placeholder="Category"
									className="col-span-3"
									isRequired
									selectedKey={form.category}
									onSelectionChange={(key) =>
										setFormData({ ...form, category: key as string })
									}
								>
									{(queryCategories.data?.categories ?? []).map((cat) => (
										<Select.Item key={cat.id} id={cat.id}>
											{cat.name}
										</Select.Item>
									))}
								</Select>
							</div>
							<div className="grid grid-cols-8 gap-4">
								<TextField
									label="Title"
									className="col-span-4"
									isRequired
									value={form.title}
									onChange={(value) => setFormData({ ...form, title: value })}
								/>
								<DatePicker
									label="Date Time"
									className="col-span-4"
									granularity="minute"
									hideTimeZone
									isRequired
									minValue={startOfMonth(currentDateTime).set({
										hour: 0,
										minute: 0,
									})}
									maxValue={currentDateTime}
									value={form.datetime}
									onChange={(value) =>
										value && setFormData({ ...form, datetime: value })
									}
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
			</Modal.Content>
		</Modal.Overlay>
	);
};

export function AppLayout() {
	const navigate = useNavigate();
	const location = useLocation();

	const setAccount = useSetAtom($account);

	const [queryAccount] = useAccountQuery();

	const requestLogout = useLogoutRequest();

	const handleLogout = () => {
		requestLogout()
			.then(() => navigate("/login"))
			.catch(({ message }) =>
				toasts.add({
					title: "Logout Failed",
					description: message,
					variant: "destructive",
				}),
			);
	};

	React.useEffect(() => {
		if (!queryAccount.fetching && !queryAccount.error) {
			setAccount(queryAccount.data?.account);
		}
	}, [queryAccount, setAccount]);

	if (queryAccount.fetching) {
		return <></>;
	}
	if (queryAccount.error) {
		return <Navigate to="/login" />;
	}
	return (
		<div className="h-full w-full flex flex-col">
			<header className="sticky top-0 z-10 py-2 px-5 flex items-center shadow-sm border-b border-border bg-background">
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
							{/* biome-ignore lint/a11y/useSemanticElements: required by react-aria-components */}
							<Avatar className="cursor-pointer" role="button">
								{queryAccount.data?.account.fullname[0].toUpperCase()}
							</Avatar>
						</Pressable>
						<Menu.Popover className="min-w-43">
							<Menu className="space-y-0">
								<Menu.Item className="flex flex-col items-start">
									<p className="text-sm font-medium leading-none">
										{queryAccount.data?.account.fullname}
									</p>
									<p className="text-xs text-muted-foreground leading-none">
										{queryAccount.data?.account.email}
									</p>
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
						</Menu.Popover>
					</Menu.Trigger>
				</div>
			</header>
			<div className="flex-1 flex">
				<aside className="sticky top-[3.3rem] h-[calc(100vh-3.3rem)] flex flex-col w-[200px] p-5 border-r border-border overflow-y-auto">
					<nav className="grid gap-2">
						{LINKS.map((link) => (
							<Button
								key={link.href}
								variant={link.href === location.pathname ? "default" : "ghost"}
								className="justify-start"
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

export { default as AppDashboardPage } from "./app/index";
export { default as AppCategoriesPage } from "./app/categories";
