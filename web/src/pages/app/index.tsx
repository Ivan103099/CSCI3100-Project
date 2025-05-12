import React from "react";
import { useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { fromAbsolute, getLocalTimeZone, now } from "@internationalized/date";
import { PieChart, Pie, BarChart, CartesianGrid, XAxis, Bar } from "recharts";
import { Calendar, ArrowDown, ArrowUp, Coins, DollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { CategoryType, type AccountSummary } from "@/lib/models";
import { $account } from "@/lib/client";
import {
	useAccountSummaryQuery,
	useCategoriesQuery,
	useTransactionsQuery,
} from "@/lib/graphql";

import Card from "@/components/Card";
import Select from "@/components/Select";
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
		average: {
			title: "Daily Average",
			border: "border-t-yellow-500",
			Icon: <Coins className="text-yellow-500" />,
		},
	};

	const [query] = useAccountSummaryQuery();

	const days = React.useMemo(() => now(getLocalTimeZone()).day, []);

	const summary = React.useMemo(() => {
		if (!query.data) return {};
		const { income, expense } = query.data.account.summary;
		const balance = income - expense;
		const average = balance / days;
		return { balance, income, expense, average };
	}, [query.data, days]);

	if (query.error) return <></>;
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Object.entries(summary)
				.filter(([key]) => key in PROPS)
				.map(([key, value]) => {
					const { title, border, Icon } = PROPS[key as keyof AccountSummary];
					return (
						<Card
							key={key}
							className={cn(
								"border-t-4 bg-gradient-to-br",
								"transition-all hover:shadow-lg hover:-translate-y-1",
								border,
							)}
						>
							<Card.Header className="flex-row items-center justify-between space-y-0 pb-2">
								<Card.Title className="text-md font-medium">{title}</Card.Title>
								{Icon}
							</Card.Header>
							<Card.Content>
								<p className="flex items-center text-2xl font-bold">
									{Number(value).toLocaleString("en-HK", {
										style: "currency",
										currency: "HKD",
									})}
									{key === "average" && (
										<span className="ml-auto font-medium text-sm text-muted-foreground">
											/ {days} days
										</span>
									)}
								</p>
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

	if (query.error) return <></>;
	return (
		<Card className="flex flex-col h-full">
			<Card.Header>
				<Card.Title>Recent Transactions</Card.Title>
				<Card.Description>
					You made {query.data?.transactions.length ?? 0} transactions this
					month.
				</Card.Description>
			</Card.Header>
			<Card.Content className="flex-1 flex flex-col divide-y divide-border">
				{query.data?.transactions.slice(0, 5).map((item) => (
					<li key={item.id} className="flex items-center py-4">
						<span
							className="flex items-center justify-center size-10 min-w-10 text-xl rounded-xl"
							style={{ backgroundColor: item.category.color }}
						>
							{item.category.emoji}
						</span>
						<div className="mx-4 space-y-1 overflow-hidden">
							<p className="text-sm font-medium leading-none truncate">
								{item.title}
							</p>
							<p className="text-sm text-muted-foreground">
								{new Date(item.timestamp * 1000).toLocaleString("en-HK")}
							</p>
						</div>
						<div
							className={cn(
								"ml-auto font-medium",
								item.category.type === CategoryType.EXPENSE && "text-red-500",
								item.category.type === CategoryType.INCOME && "text-green-500",
							)}
						>
							{item.amount.toLocaleString("en-HK", {
								style: "currency",
								currency: "HKD",
							})}
						</div>
					</li>
				))}
			</Card.Content>
			<Card.Footer>
				<Button
					className="w-full"
					variant="outline"
					size="sm"
					onPress={() => navigate("/transactions")}
				>
					View All Transactions
				</Button>
			</Card.Footer>
		</Card>
	);
};

const CategorizedBreakdown = () => {
	const [type, setType] = React.useState(CategoryType.EXPENSE);

	const [query] = useCategoriesQuery(type);

	const chart = React.useMemo(
		() =>
			(query.data?.categories ?? []).reduce(
				(result, cat) => {
					result[cat.name] = { label: cat.name };
					return result;
				},
				{} as Record<string, { label: string }>,
			),
		[query.data],
	);

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
		() => ({
			verb: type === CategoryType.EXPENSE ? "spent" : "earned",
			data: data
				.filter((cat) => cat.amount > 0)
				.reduce((m, i) => (m.amount > i.amount ? m : i), {
					category: "?",
					amount: 0,
				}),
		}),
		[type, data],
	);

	if (query.error) return <></>;
	return (
		<Card className="flex flex-col h-full">
			<Card.Header className="flex-row items-center justify-between gap-2">
				<div className="space-y-1.5">
					<Card.Title>Categorized Breakdown</Card.Title>
					<Card.Description>
						You {most.verb} most on {most.data.category} this month.
					</Card.Description>
				</div>
				<Select
					className="font-medium"
					selectedKey={type}
					onSelectionChange={(key) => setType(key as CategoryType)}
				>
					<Select.Item id={CategoryType.EXPENSE}>Expense</Select.Item>
					<Select.Item id={CategoryType.INCOME}>Income</Select.Item>
				</Select>
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
					className="w-full"
					variant="outline"
					size="sm"
					onPress={() => navigate("/budgets")}
				>
					View Details
				</Button>
			</Card.Footer>
		</Card>
	);
};

const DailyBalance = () => {
	const [query] = useTransactionsQuery();

	const chart = React.useMemo(
		() => ({
			income: { label: "Income" },
			expense: { label: "Expense" },
		}),
		[],
	);

	// FIXME: this is a bit messy
	const data = React.useMemo(() => {
		const current = now(getLocalTimeZone());
		const incomes = (query.data?.transactions ?? []).filter(
			(item) => item.category.type === CategoryType.INCOME,
		);
		const expenses = (query.data?.transactions ?? []).filter(
			(item) => item.category.type === CategoryType.EXPENSE,
		);
		const getDay = (timestamp: number) =>
			fromAbsolute(timestamp * 1000, getLocalTimeZone()).day;
		const data = [];
		for (let day = 1; day <= current.day; day++) {
			const income = incomes
				.filter((item) => getDay(item.timestamp) === day)
				.reduce((sum, { amount }) => sum + amount, 0);
			const expense = expenses
				.filter((item) => getDay(item.timestamp) === day)
				.reduce((sum, { amount }) => sum + amount, 0);
			data.push({ day, income, expense });
		}
		return data;
	}, [query.data]);

	const most = React.useMemo(
		() =>
			data
				.filter((item) => item.income > 0 || item.expense > 0)
				.reduce((m, i) => (m.expense > i.expense ? m : i), {
					day: 0,
					expense: 0,
					income: 0,
				}),
		[data],
	);

	return (
		<Card className="h-full">
			<Card.Header className="flex-row items-center justify-between gap-2">
				<div className="space-y-1.5">
					<Card.Title>Daily Balance</Card.Title>
					<Card.Description>
						Your spent most on day {most.day || "?"} of this month.
					</Card.Description>
				</div>
			</Card.Header>
			<Card.Content>
				<ChartContainer
					config={chart}
					className="mx-auto aspect-square w-full max-h-[300px]"
				>
					<BarChart data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="day"
							tickLine={false}
							axisLine={false}
							interval={0}
						/>
						<ChartTooltip
							cursor={most.day !== 0}
							content={<ChartTooltipContent hideLabel />}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="income"
							fill="var(--color-emerald-500)"
							radius={[2, 2, 0, 0]}
						/>
						<Bar
							dataKey="expense"
							fill="var(--color-rose-500)"
							radius={[2, 2, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</Card.Content>
		</Card>
	);
};

export default function AppDashboardPage() {
	const account = useAtomValue($account);

	const date = React.useMemo(() => new Date(), []);

	return (
		<main className="flex-1 p-4 md:p-8 space-y-4">
			<div className="flex items-center justify-between pb-2">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Overview</div>
					<div className="text-lg text-muted-foreground">
						Welcome back, {account?.fullname}!
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Calendar className="size-4" />
						{`${date.toLocaleString("en-HK", { month: "long" })} ${date.getFullYear()}`}
					</Button>
				</div>
			</div>
			<SummaryCards />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
				<div className="col-span-4">
					<RecentTransactions />
				</div>
				<div className="col-span-4">
					<CategorizedBreakdown />
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
				<div className="col-span-4">
					<DailyBalance />
				</div>
				<div className="col-span-4">
					<BudgetPlan />
				</div>
			</div>
		</main>
	);
}
