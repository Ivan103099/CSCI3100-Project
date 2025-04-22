import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
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

import {
	useAccountQuery,
	useCategoriesQuery,
	useCreateTransactionMutation,
	useLogoutMutation,
} from "@/lib/client";

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
		type: "expense" as "income" | "expense",
		category: "",
		title: "" as string,
		note: "" as string | undefined,
		time: currentDateTime,
		amount: 0,
	};
	const [data, setData] = React.useState(init);

	const queryCategories = useCategoriesQuery();
	const mutatuinCreateTransaction = useCreateTransactionMutation();

	const categories = React.useMemo(() => {
		if (!queryCategories.isSuccess) {
			return [];
		}
		return Object.values(queryCategories.data).filter(
			(cat) => cat.type === data.type,
		);
	}, [queryCategories, data.type]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutatuinCreateTransaction.mutate(
			{
				title: data.title,
				note: data.note,
				amount: data.amount,
				time: data.time.toDate(),
				cid: data.category,
			},
			{
				onSuccess: (id) =>
					toasts.add(
						{
							title: "Transaction Created",
							description: id,
							variant: "success",
						},
						{ timeout: 3000 },
					),
				onError: (error) =>
					toasts.add(
						{
							title: "Transaction Create Failed",
							description: error.message,
							variant: "destructive",
						},
						{ timeout: 3000 },
					),
			},
		);
	};

	React.useEffect(() => {
		data.type && setData((d) => ({ ...d, category: "" }));
	}, [data.type]);

	return (
		<Modal.Overlay>
			<Modal.Content>
				{queryCategories.isSuccess &&
					(({ close }) => (
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
									setData(init);
									close();
								}}
							>
								<div className="grid grid-cols-8 gap-4">
									<NumberField
										autoFocus
										label="Amount"
										// prefix="$"
										className="col-span-3"
										isRequired
										formatOptions={{
											style: "currency",
											currency: "HKD",
											currencySign: "standard",
											currencyDisplay: "symbol",
										}}
										minValue={0}
										value={data.amount}
										onChange={(value) =>
											value >= 0 && setData({ ...data, amount: value })
										}
									/>
									<Select
										label="Type"
										placeholder="Type"
										className="col-span-2"
										isRequired
										selectedKey={data.type}
										onSelectionChange={(key) =>
											setData({ ...data, type: key as "income" | "expense" })
										}
									>
										<Select.Item id="expense">Expense</Select.Item>
										<Select.Item id="income">Income</Select.Item>
									</Select>
									<Select
										label="Category"
										placeholder="Category"
										className="col-span-3"
										isRequired
										selectedKey={data.category}
										onSelectionChange={(key) =>
											setData({ ...data, category: key as string })
										}
									>
										{categories.map((cat) => (
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
										value={data.title}
										onChange={(value) => setData({ ...data, title: value })}
									/>
									<DatePicker
										label="Time"
										className="col-span-4"
										granularity="minute"
										hideTimeZone
										isRequired
										minValue={startOfMonth(currentDateTime).set({
											hour: 0,
											minute: 0,
										})}
										maxValue={currentDateTime}
										value={data.time}
										onChange={(value) =>
											value && setData({ ...data, time: value })
										}
									/>
								</div>
								<TextField
									label="Optional Note"
									className="w-full"
									value={data.note}
									onChange={(value) => setData({ ...data, note: value })}
								/>
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
					))}
			</Modal.Content>
		</Modal.Overlay>
	);
};

export function AppLayout() {
	const navigate = useNavigate();
	const location = useLocation();

	const queryAccount = useAccountQuery();
	const queryCategories = useCategoriesQuery();
	const mutationLogout = useLogoutMutation();

	const handleLogout = () => {
		mutationLogout.mutate(undefined, {
			onSuccess: () => navigate("/login"),
			onError: ({ message }) => {
				toasts.add(
					{
						title: "Logout Failed",
						description: message,
						variant: "destructive",
					},
					{ timeout: 3000 },
				);
			},
		});
	};

	if (queryAccount.isPending) {
		return <></>;
	}
	if (queryAccount.isError) {
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
						<Button
							size="sm"
							variant="secondary"
							isDisabled={!queryCategories.isSuccess}
						>
							<Plus className="size-4" />
							New Transaction
						</Button>
						<TransactionModal />
					</Modal.Trigger>
					<Menu.Trigger>
						<Pressable>
							{/* biome-ignore lint/a11y/useSemanticElements: required by react-aria-components */}
							<Avatar className="cursor-pointer" role="button">
								{queryAccount.data.fullname[0].toUpperCase()}
							</Avatar>
						</Pressable>
						<Menu.Popover className="min-w-43">
							<Menu className="space-y-0">
								<Menu.Item className="flex flex-col items-start">
									<p className="text-sm font-medium leading-none">
										{queryAccount.data.fullname}
									</p>
									<p className="text-xs text-muted-foreground leading-none">
										{queryAccount.data.email}
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
