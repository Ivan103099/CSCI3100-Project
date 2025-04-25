import React from "react";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import type { TxnType } from "@/lib/models";
import { useCategoriesQuery } from "@/lib/graphql";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Menu from "@/components/Menu";
import Tabs from "@/components/Tabs";
import SearchField from "@/components/SearchField";

export default function AppCategoriesPage() {
	const [tab, setTab] = React.useState("ALL");
	const [search, setSearch] = React.useState("");

	const [query] = useCategoriesQuery(
		tab === "ALL" ? undefined : (tab as TxnType),
	);

	const categories = React.useMemo(
		() =>
			(query.data?.categories ?? []).filter((category) => {
				if (!search) return true;
				return category.name.toLowerCase().includes(search.toLowerCase());
			}),
		[query.data, search],
	);

	return (
		<main className="flex-1 p-4 md:p-8 space-y-4">
			<div className="flex items-center justify-between px-2 pb-2">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Categories</div>
					<div className="text-lg text-muted-foreground">
						Create and manage your transaction categories.
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button>
						<Plus className="size-4" />
						New Category
					</Button>
				</div>
			</div>
			<SearchField
				value={search}
				onChange={setSearch}
				placeholder="Search Categories..."
			/>
			<Tabs
				selectedKey={tab}
				onSelectionChange={(key) => setTab(key.toString())}
			>
				<Tabs.Nav className="self-start">
					<Tabs.NavItem id="ALL">All</Tabs.NavItem>
					<Tabs.NavItem id="EXPENSE">Expense</Tabs.NavItem>
					<Tabs.NavItem id="INCOME">Income</Tabs.NavItem>
				</Tabs.Nav>
				<Tabs.Content
					id={tab}
					className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
				>
					{categories.map((category) => (
						<Card
							key={category.id}
							className="transition-all hover:shadow-lg hover:-translate-y-1 w-full"
						>
							<Card.Content className="pt-5 relative">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 overflow-hidden mr-10">
										<p className="flex items-center justify-center size-10 min-w-10 rounded-xl text-xl bg-blue-200">
											{"🍖"}
										</p>
										<p className="text-xl font-medium">{category.name}</p>
									</div>
									<Menu.Trigger>
										<Button
											variant="ghost"
											className="absolute right-5 p-2 h-5"
										>
											<MoreHorizontal className="size-4" />
										</Button>
										<Menu.Popover className="min-w-28">
											<Menu className="space-y-0">
												<Menu.Item onAction={() => ({})}>
													<Edit className="size-4" />
													Edit
												</Menu.Item>
												<Menu.Separator />
												<Menu.Item
													onAction={() => ({})}
													className="font-medium text-rose-500 focus:text-rose-500"
												>
													<Trash className="size-4" />
													Delete
												</Menu.Item>
											</Menu>
										</Menu.Popover>
									</Menu.Trigger>
								</div>
							</Card.Content>
							<Card.Footer className="flex justify-between items-center gap-3 py-3 rounded-b-md bg-secondary overflow-x-scroll">
								<span className="font-medium text-sm text-nowrap">
									{category.transactions.length} Transactions
								</span>
								<span className="font-bold text-lg">
									{category.transactions
										.reduce((sum, t) => sum + t.amount, 0)
										.toLocaleString("en-HK", {
											style: "currency",
											currency: "HKD",
										})}
								</span>
							</Card.Footer>
						</Card>
					))}
				</Tabs.Content>
			</Tabs>
		</main>
	);
}
