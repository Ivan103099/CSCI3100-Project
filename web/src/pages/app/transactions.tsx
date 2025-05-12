import React from "react";
import {
	Calendar,
	Download,
	Edit,
	Funnel,
	MoreHorizontal,
	Trash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CategoryType } from "@/lib/models";
import { useCategoriesQuery, useTransactionsQuery } from "@/lib/graphql";

import Menu from "@/components/Menu";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Select from "@/components/Select";
import SearchField from "@/components/SearchField";
import NumberField from "@/components/NumberField";

type Filters = {
	enabled: boolean;
	type: CategoryType;
	category: string;
	minAmount: number;
	maxAmount: number;
};

const initFilters = (): Filters => ({
	enabled: false,
	type: "" as CategoryType,
	category: "",
	minAmount: 0,
	maxAmount: Number.POSITIVE_INFINITY,
});

const FiltersCard = ({
	filters,
	onFiltersChange,
}: { filters: Filters; onFiltersChange: (filters: Filters) => void }) => {
	const [queryCategories] = useCategoriesQuery();

	const categories = React.useMemo(
		() =>
			(queryCategories.data?.categories ?? []).filter((cat) => {
				if (!filters.type) return true;
				return cat.type === filters.type;
			}),
		[queryCategories.data, filters],
	);

	return (
		<Card className="p-5 inline-block self-end w-2/3">
			<Card.Content className="p-0 grid grid-cols-5 gap-4">
				<Select
					label="Type"
					placeholder="Type"
					className="col-span-1"
					selectedKey={filters.type}
					onSelectionChange={(key) =>
						onFiltersChange({
							...filters,
							type: key as CategoryType,
							category: "",
						})
					}
				>
					<Select.Item id="">All Types</Select.Item>
					<Select.Item id={CategoryType.EXPENSE}>Expense</Select.Item>
					<Select.Item id={CategoryType.INCOME}>Income</Select.Item>
				</Select>
				<Select
					label="Category"
					className="col-span-2"
					placeholder={categories.length ? "Category" : "None"}
					selectedKey={filters.category}
					onSelectionChange={(key) =>
						onFiltersChange({
							...filters,
							type:
								// FIXME: this is a bit hacky
								queryCategories.data?.categories.find(
									(cat) => cat.id === key.toString(),
								)?.type ?? filters.type,
							category: key.toString(),
						})
					}
				>
					{!filters.type && <Select.Item id="">All Categories</Select.Item>}
					{categories.map((cat) => (
						<Select.Item key={cat.id} id={cat.id}>
							{cat.emoji}
							<span className="ml-1.5">{cat.name}</span>
						</Select.Item>
					))}
				</Select>
				<NumberField
					label="Min. Amount"
					className="col-span-1"
					minValue={0}
					maxValue={filters.maxAmount}
					value={filters.minAmount}
					onChange={(value) =>
						value <= filters.maxAmount &&
						onFiltersChange({ ...filters, minAmount: value })
					}
					formatOptions={{
						style: "currency",
						currency: "HKD",
						currencySign: "standard",
						currencyDisplay: "symbol",
					}}
				/>
				<NumberField
					label="Max. Amount"
					className="col-span-1"
					minValue={filters.minAmount}
					maxValue={Number.POSITIVE_INFINITY}
					value={filters.maxAmount}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							maxAmount:
								value >= filters.minAmount ? value : Number.POSITIVE_INFINITY,
						})
					}
					formatOptions={{
						style: "currency",
						currency: "HKD",
						currencySign: "standard",
						currencyDisplay: "symbol",
					}}
				/>
			</Card.Content>
		</Card>
	);
};

export default function AppTransactionsPage() {
	const [search, setSearch] = React.useState("");
	const [filters, setFilters] = React.useState(initFilters());
	const [selection, setSelection] = React.useState("");

	const [query] = useTransactionsQuery();

	const transactions = React.useMemo(
		() =>
			(query.data?.transactions ?? [])
				.filter((item) => {
					if (!search) return true;
					return item.title.toLowerCase().includes(search.toLowerCase());
				})
				.filter((item) => {
					if (!filters.enabled) return true;
					if (filters.type && item.category.type !== filters.type) return false;
					if (filters.category && item.category.id !== filters.category)
						return false;
					if (item.amount < filters.minAmount) return false;
					if (item.amount > filters.maxAmount) return false;
					return true;
				})
				.map((item) => ({
					...item,
					// for convenience to be used in below code
					datetime: new Date(item.timestamp * 1000),
				})),
		[query.data, search, filters],
	);

	const handleExport = () => {
		const data = JSON.stringify(query.data?.transactions ?? [], null, 2);
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = "transactions.json";
		link.href = url;
		link.click();
		link.remove();
	};

	return (
		<main className="flex-1 flex flex-col p-4 md:p-8 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Transactions</div>
					<div className="text-lg text-muted-foreground">
						View and manage all your transactions.
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button onPress={() => handleExport()}>
						<Download className="size-4" />
						Export Data
					</Button>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<SearchField
					placeholder="Search Transactions..."
					className="w-full"
					value={search}
					onChange={setSearch}
				/>
				<Button variant="outline">
					<Calendar className="size-4" />
					Date Range
				</Button>
				<Button
					variant={filters.enabled ? "default" : "outline"}
					onPress={() => setFilters({ ...filters, enabled: !filters.enabled })}
				>
					<Funnel className="size-4" />
					Filters
				</Button>
			</div>
			{filters.enabled && (
				<FiltersCard filters={filters} onFiltersChange={(f) => setFilters(f)} />
			)}
			<div className="border border-border rounded-md">
				<Table>
					<Table.Header>
						<Table.Column isRowHeader>Title</Table.Column>
						<Table.Column>Category</Table.Column>
						<Table.Column>Date</Table.Column>
						<Table.Column>Time</Table.Column>
						<Table.Column className="text-right">Amount</Table.Column>
						<Table.Column />
					</Table.Header>
					<Table.Body renderEmptyState={() => "No Data"}>
						{transactions.map((item) => (
							<>
								<Table.Row
									key={item.id}
									className={cn(item.id === selection && "bg-muted")}
									onAction={() =>
										setSelection((prev) => (prev === item.id ? "" : item.id))
									}
								>
									<Table.Cell className="font-medium">{item.title}</Table.Cell>
									<Table.Cell>
										<span className="border border-border px-2 py-1 rounded-3xl text-xs font-medium">
											{item.category.emoji}
											<span className="ml-1.5">{item.category.name}</span>
										</span>
									</Table.Cell>
									<Table.Cell>
										{item.datetime.toLocaleDateString("en-HK", {
											dateStyle: "long",
										})}
									</Table.Cell>
									<Table.Cell>
										{item.datetime.toLocaleTimeString("en-HK")}
									</Table.Cell>
									<Table.Cell
										className={cn(
											"font-medium text-right",
											item.category.type === CategoryType.EXPENSE &&
												"text-red-500",
											item.category.type === CategoryType.INCOME &&
												"text-green-500",
										)}
									>
										{item.amount.toLocaleString("en-HK", {
											style: "currency",
											currency: "HKD",
										})}
									</Table.Cell>
									<Table.Cell className="flex justify-end items-center">
										<Menu.Trigger>
											<Button variant="ghost" className="p-2 h-5">
												<MoreHorizontal className="size-4" />
											</Button>
											<Menu className="min-w-28">
												<Menu.Item onAction={() => ({})}>
													<Edit className="size-4" />
													Edit
												</Menu.Item>
												<Menu.Separator />
												<Menu.Item
													className="font-medium text-rose-500 focus:text-rose-500"
													onAction={() => ({})}
												>
													<Trash className="size-4" />
													Delete
												</Menu.Item>
											</Menu>
										</Menu.Trigger>
									</Table.Cell>
								</Table.Row>
								{item.id === selection && (
									<Table.Row className="bg-muted/50">
										<Table.Cell colSpan={6} className="p-5">
											<div className="grid grid-cols-6 gap-4">
												<div
													className="p-5 col-span-1 text-7xl flex items-center justify-center rounded-lg bg-card border border-border"
													style={{ backgroundColor: item.category.color }}
												>
													{item.category.emoji}
												</div>
												<div className="p-5 col-span-3 grid grid-cols-2 gap-3 rounded-lg bg-card border border-border">
													{[
														{ label: "ID", value: item.id },
														{ label: "Title", value: item.title },
														{ label: "Type", value: item.category.type },
														{ label: "Category", value: item.category.name },
														{
															label: "Date",
															value: item.datetime.toLocaleDateString("en-HK"),
														},
														{
															label: "Time",
															value: item.datetime.toLocaleTimeString("en-HK"),
														},
													].map(({ label, value }) => (
														<div key={label} className="flex flex-col gap-1">
															<div className="text-sm font-medium leading-none">
																{label}
															</div>
															<p className="truncate">{value}</p>
														</div>
													))}
												</div>
												<div className="p-5 col-span-2 flex flex-col items-center justify-center rounded-lg bg-card border border-border">
													<div className="text-sm font-medium text-muted-foreground">
														Amount
													</div>
													<div
														className={cn(
															"text-2xl font-bold my-4",
															item.category.type === CategoryType.EXPENSE &&
																"text-red-500",
															item.category.type === CategoryType.INCOME &&
																"text-green-500",
														)}
													>
														{item.amount.toLocaleString("en-HK", {
															style: "currency",
															currency: "HKD",
														})}
													</div>
													<div className="text-sm text-muted-foreground">
														{item.category.type}
													</div>
												</div>
											</div>
										</Table.Cell>
									</Table.Row>
								)}
							</>
						))}
					</Table.Body>
				</Table>
			</div>
			<span className="text-xs text-muted-foreground font-medium">
				Showing {!filters.enabled && "all"} {transactions.length} results.
			</span>
		</main>
	);
}
