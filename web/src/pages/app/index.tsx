import React from "react";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { PieChart, Pie } from "recharts";
import {
	Calendar,
	ArrowDown,
	ArrowUp,
	DollarSign,
	PiggyBank,
} from "lucide-react";

import type { AccountSummary } from "@/lib/models";
import { $account } from "@/lib/client";
import {
	useAccountSummaryQuery,
	useCategoriesQuery,
	useTransactionsQuery,
} from "@/lib/graphql";

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

	const [query] = useAccountSummaryQuery();

	if (query.error) {
		return <></>;
	}
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Object.entries(query.data?.account.summary || {})
				.filter(([key]) => key in PROPS)
				.map(([key, value]) => {
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
								<p className="text-2xl font-bold">
									{value.toLocaleString("en-HK", {
										style: "currency",
										currency: "HKD",
									})}
								</p>
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

	const [query] = useTransactionsQuery();

	if (query.error) {
		return <></>;
	}
	return (
		<Card className="flex flex-col justify-between h-full">
			<Card.Header>
				<Card.Title>Recent Transactions</Card.Title>
				<Card.Description>
					You made {query.data?.transactions.length ?? 0} transactions this
					month.
				</Card.Description>
			</Card.Header>
			<Card.Content className="flex flex-col divide-y divide-border">
				{query.data?.transactions.slice(0, 5).map((item) => {
					const type = item.category.type;
					const color = type === "INCOME" ? "text-green-500" : "text-red-500";
					return (
						<li
							key={item.id}
							className="flex items-center py-4 overflow-hidden"
						>
							<span
								className="flex items-center justify-center size-10 rounded-xl text-xl"
								style={{ backgroundColor: item.category.color }}
							>
								{item.category.emoji}
							</span>
							<div className="mx-4 space-y-1 overflow-scroll">
								<p className="text-sm text-ellipsis font-medium leading-none">
									{item.title}
								</p>
								<p className="text-sm text-muted-foreground">
									{new Date(item.timestamp * 1000).toLocaleString("en-HK")}
								</p>
							</div>
							<div className={`ml-auto font-medium ${color}`}>
								{item.amount.toLocaleString("en-HK", {
									style: "currency",
									currency: "HKD",
								})}
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
	const [query] = useCategoriesQuery("EXPENSE");

	const chart = React.useMemo(() => {
		return (query.data?.categories ?? []).reduce(
			(result, cat) => {
				result[cat.name] = { label: cat.name };
				return result;
			},
			{} as Record<string, { label: string }>,
		);
	}, [query.data]);

	const data = React.useMemo(
		() =>
			(query.data?.categories ?? []).map((cat) => ({
				fill: cat.color,
				category: cat.name,
				amount: cat.transactions.reduce((acc, item) => acc + item.amount, 0),
			})),
		[query.data],
	);

	const most = React.useMemo(
		() =>
			data
				.filter((cat) => cat.amount > 0)
				.reduce((m, i) => (m.amount > i.amount ? m : i), {
					category: "?",
					amount: 0,
				}),
		[data],
	);

	if (query.error) {
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
		const month = date.toLocaleString("en-HK", { month: "long" });
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
