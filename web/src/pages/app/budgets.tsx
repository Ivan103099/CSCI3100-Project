import React from "react";
import { Form } from "react-aria-components";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { cn } from "@/lib/utils";
import { CategoryType } from "@/lib/models";
import {
	useBudgetsQuery,
	useCategoriesQuery,
	useCreateBudgetMutation,
} from "@/lib/graphql";

import Card from "@/components/Card";
import Menu from "@/components/Menu";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Progress from "@/components/Progress";
import NumberField from "@/components/NumberField";
import { toasts } from "@/components/Toast";

type BudgetForm = {
	category: string;
	amount: number;
};

const initBudgetForm = (): BudgetForm => ({
	category: "",
	amount: 0,
});

const BudgetModal = () => {
	const [form, setFormData] = React.useState(initBudgetForm());

	const [queryCategories] = useCategoriesQuery(CategoryType.EXPENSE);
	const [, createBudget] = useCreateBudgetMutation();

	const categories = React.useMemo(
		() => queryCategories.data?.categories.filter((cat) => !cat.budget) ?? [],
		[queryCategories.data],
	);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		createBudget({
			cid: form.category,
			amount: form.amount,
		}).then(({ error, data }) => {
			if (error)
				toasts.add(
					{
						title: "Budget Create Failed",
						description: error.message,
						variant: "destructive",
					},
					{ timeout: 5000 },
				);
			else
				toasts.add(
					{
						title: "Budget Created",
						description: data?.createBudget.category.id ?? "",
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
						<Modal.Title>Create New Budget</Modal.Title>
					</Modal.Header>
					<Form
						id="form"
						className="grid grid-cols-5 gap-4"
						onSubmit={(e) => {
							close();
							handleSubmit(e);
							setFormData(initBudgetForm());
						}}
					>
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
					</Form>
					<span className="text-center text-sm text-muted-foreground font-medium">{`~ ${(
						(form.amount || 0) / 30
					).toLocaleString("en-HK", {
						style: "currency",
						currency: "HKD",
					})} / day`}</span>
					<Modal.Footer>
						<Button onPress={close} type="button" variant="outline">
							Cancel
						</Button>
						<Button type="submit" form="form">
							Create Budget
						</Button>
					</Modal.Footer>
				</>
			)}
		</Modal>
	);
};

export default function AppBudgetsPage() {
	const [query] = useBudgetsQuery();

	return (
		<main className="flex-1 p-4 md:p-8 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Budgets</div>
					<div className="text-lg text-muted-foreground">
						Create and manage your expense category budgets.
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Modal.Trigger>
						<Button>
							<Plus className="size-4" />
							New Budget
						</Button>
						<BudgetModal />
					</Modal.Trigger>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{(query.data?.budgets ?? []).map((budget) => {
					const total = budget?.amount ?? 0;
					const spent = budget.category.transactions.reduce(
						(sum, t) => sum + t.amount,
						0,
					);
					return (
						<Card
							key={budget.category.id}
							className="w-full transition-all hover:shadow-lg hover:-translate-y-1"
						>
							<Card.Content className="pt-5 pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3 overflow-hidden">
										<span
											className="flex items-center justify-center size-10 min-w-10 text-xl rounded-xl"
											style={{ backgroundColor: budget.category.color }}
										>
											{budget.category.emoji}
										</span>
										<p className="text-xl font-medium truncate">
											{budget.category.name}
										</p>
									</div>
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
								</div>
							</Card.Content>
							<Card.Footer className="flex flex-col rounded-b-md">
								<Progress
									label={`${Math.abs(total - spent).toLocaleString("en-HK", {
										style: "currency",
										currency: "HKD",
									})} ${(total - spent) > 0 ? "left" : "over"}`}
									value={spent}
									max={total}
									className={cn("my-2", total - spent <= 0 && "text-rose-500")}
									fill={cn(total - spent <= 0 && "bg-rose-500")}
								/>
								<div className="w-full flex justify-between items-center gap-3">
									<span className="font-medium text-sm">Spent</span>
									<span className="font-bold text-lg">
										{spent.toLocaleString("en-HK", {
											style: "currency",
											currency: "HKD",
										})}
									</span>
								</div>
								<div className="w-full flex justify-between items-center gap-3">
									<span className="font-medium text-xs text-muted-foreground">
										Budget
									</span>
									<span className="font-bold text-sm text-muted-foreground">
										{total.toLocaleString("en-HK", {
											style: "currency",
											currency: "HKD",
										})}
									</span>
								</div>
							</Card.Footer>
						</Card>
					);
				})}
			</div>
		</main>
	);
}
