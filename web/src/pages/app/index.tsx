import React from "react";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { PieChart, Pie } from "recharts";
import {
	Calendar,
	ArrowDown,
	ArrowUp,
	DollarSign,
	CreditCard,
	PiggyBank,
} from "lucide-react";

import {
	$account,
	type AccountSummary,
	useAccountSummaryQuery,
	useCategoriesQuery,
	useTransactionsQuery,
} from "@/lib/client";

import Card from "@/components/Card";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/Chart";

const SummaryCards = () => {
	const PROPS = {
		balance: {
			title: "Total Balance",
			border: "border-t-primary",
			Icon: <DollarSign className="text-muted-foreground" />,
		},
		income: {
			title: "Income",
			border: "border-t-green-500",
			Icon: <ArrowUp className="text-green-500" />,
		},
		expense: {
			title: "Expense",
			border: "border-t-red-500",
			Icon: <ArrowDown className="text-red-500" />,
		},
		budget: {
			title: "Budget",
			border: "border-t-yellow-500",
			Icon: <PiggyBank className="text-yellow-500" />,
		},
	};

	const querySummary = useAccountSummaryQuery();

	if (!querySummary.isSuccess) {
		return <></>;
	}
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Object.entries(querySummary.data).map(([key, value]) => {
				const { title, border, Icon } = PROPS[key as keyof AccountSummary];
				return (
					<Card
						key={key}
						className={`border-t-4 ${border} bg-gradient-to-br transition-all hover:shadow-lg hover:-translate-y-1 from-card to-background`}
					>
						<Card.Header className="flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title className="text-md font-medium">{title}</Card.Title>
							{Icon}
						</Card.Header>
						<Card.Content>
							<p className="text-2xl font-bold">${value as number}</p>
							<p className="text-sm text-muted-foreground">{""}</p>
						</Card.Content>
					</Card>
				);
			})}
		</div>
	);
};

const RecentTransactions = () => {
	const navigate = useNavigate();

	const queryCategories = useCategoriesQuery();
	const queryTransactions = useTransactionsQuery();

	if (!queryCategories.isSuccess || !queryTransactions.isSuccess) {
		return <></>;
	}
	return (
		<Card className="flex flex-col justify-between h-full">
			<Card.Header>
				<Card.Title>Recent Transactions</Card.Title>
				<Card.Description>
					You made {queryTransactions.data.length} transactions this month.
				</Card.Description>
			</Card.Header>
			<Card.Content className="flex flex-col divide-y divide-border">
				{queryTransactions.data.slice(0, 5).map((item) => {
					const type = queryCategories.data[item.cid].type;
					const color = type === "income" ? "text-green-500" : "text-red-500";
					return (
						<li key={item.id} className="flex items-center w-full py-4">
							<Avatar>
								<CreditCard className="size-4" />
							</Avatar>
							<div className="ml-4 space-y-1">
								<p className="text-sm font-medium leading-none">{item.title}</p>
								<p className="text-sm text-muted-foreground">
									{new Date(item.time).toLocaleString("en-GB")}
								</p>
							</div>
							<div className={`ml-auto font-medium ${color}`}>
								${item.amount}
							</div>
						</li>
					);
				})}
			</Card.Content>
			<Card.Footer>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onPress={() => navigate("/transactions")}
				>
					View All Transactions
				</Button>
			</Card.Footer>
		</Card>
	);
};

const ExpenseBreakdown = () => {
	const COLORS = [
		"var(--color-blue-400)",
		"var(--color-blue-600)",
		"var(--color-indigo-400)",
		"var(--color-indigo-600)",
		"var(--color-yellow-400)",
		"var(--color-yellow-600)",
	];

	const queryCategories = useCategoriesQuery();
	const queryTransactions = useTransactionsQuery();

	const categories = React.useMemo(
		() =>
			Object.entries(queryCategories.data ?? {}).filter(
				([_, { type }]) => type === "expense",
			),
		[queryCategories],
	);

	const chart = React.useMemo(() => {
		return categories.reduce(
			(result, [_, cat]) => {
				result[cat.name] = { label: cat.name };
				return result;
			},
			{} as Record<string, { label: string }>,
		);
	}, [categories]);

	const data = React.useMemo(() => {
		if (!queryTransactions.isSuccess) {
			return [];
		}
		return categories.map(([cid, cat], i) => ({
			category: cat.name,
			amount: queryTransactions.data
				.filter((item) => item.cid === cid)
				.reduce((acc, item) => acc + item.amount, 0),
			fill: COLORS[i % COLORS.length],
		}));
	}, [categories, queryTransactions]);

	const most = React.useMemo(
		() =>
			data.length
				? data.reduce((m, i) => (m.amount > i.amount ? m : i))
				: undefined,
		[data],
	);

	if (!queryCategories.isSuccess || !queryTransactions.isSuccess) {
		return <></>;
	}
	return (
		<Card>
			<Card.Header>
				<Card.Title>Expense Breakdown</Card.Title>
				<Card.Description>
					You spent most on {most?.category ?? "?"} this month.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<ChartContainer
					config={chart}
					className="mx-auto aspect-square max-h-[400px]"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie data={data} dataKey="amount" nameKey="category" />
						<ChartLegend
							content={<ChartLegendContent nameKey="category" />}
							className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
						/>
					</PieChart>
				</ChartContainer>
			</Card.Content>
		</Card>
	);
};

const BudgetPlan = () => {
	const navigate = useNavigate();
	return (
		<Card className="flex flex-col justify-between h-full">
			<Card.Header>
				<Card.Title>Budget Plan</Card.Title>
				<Card.Description>
					Your budget progress for this month.
				</Card.Description>
			</Card.Header>
			<Card.Content>{}</Card.Content>
			<Card.Footer>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onPress={() => navigate("/budgets")}
				>
					View Details
				</Button>
			</Card.Footer>
		</Card>
	);
};

const SavingGoals = () => {
	const navigate = useNavigate();
	return (
		<Card className="flex flex-col justify-between h-full">
			<Card.Header>
				<Card.Title>Savings Goals</Card.Title>
				<Card.Description>
					Track your progress towards financial goals.
				</Card.Description>
			</Card.Header>
			<Card.Content>{}</Card.Content>
			<Card.Footer>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onPress={() => navigate("/savings")}
				>
					View Details
				</Button>
			</Card.Footer>
		</Card>
	);
};

export default function AppDashboardPage() {
	const account = useAtomValue($account);

	const currentMonthYear = React.useMemo(() => {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.toLocaleString("en-GB", { month: "long" });
		return { year, month };
	}, []);

	return (
		<main className="flex-1 p-4 md:p-8 space-y-4">
			<div className="flex items-center justify-between px-2 pb-2">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Overview</div>
					<div className="text-lg text-muted-foreground">
						Welcome back, {account?.fullname}!
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Calendar className="size-4" />
						{`${currentMonthYear.month} ${currentMonthYear.year}`}
					</Button>
				</div>
			</div>
			<SummaryCards />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<div className="col-span-4">
					<RecentTransactions />
				</div>
				<div className="col-span-3">
					<ExpenseBreakdown />
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				<BudgetPlan />
				<SavingGoals />
			</div>
		</main>
	);
}
