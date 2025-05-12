import React from "react";
import { Label, Form, parseColor, type Color } from "react-aria-components";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { CategoryType } from "@/lib/models";
import { useCategoriesQuery, useCreateCategoryMutation } from "@/lib/graphql";

import Tabs from "@/components/Tabs";
import Card from "@/components/Card";
import Menu from "@/components/Menu";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Select from "@/components/Select";
import TextField from "@/components/TextField";
import SearchField from "@/components/SearchField";
import ColorPicker from "@/components/ColorPicker";
import EmojiPicker from "@/components/EmojiPicker";
import { toasts } from "@/components/Toast";

type CategoryForm = {
	name: string;
	type: CategoryType;
	color: Color;
	emoji: { emoji: string; label: string };
};

const initCategoryForm = (): CategoryForm => ({
	name: "",
	type: CategoryType.EXPENSE,
	color: parseColor("#000000"),
	emoji: { emoji: "🪙", label: "Coin" },
});

const CategoryModal = () => {
	const [form, setFormData] = React.useState(initCategoryForm());

	const [, createCategory] = useCreateCategoryMutation();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		createCategory({
			name: form.name,
			emoji: form.emoji.emoji,
			color: form.color.toString("hex"),
			type: form.type,
		}).then(({ error, data }) => {
			if (!error)
				toasts.add(
					{
						title: "Category Created",
						description: data?.createCategory.id ?? "",
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
						<Modal.Title>Create New Category</Modal.Title>
					</Modal.Header>
					<Form
						id="form"
						className="flex flex-col gap-4"
						onSubmit={(e) => {
							close();
							handleSubmit(e);
							setFormData(initCategoryForm());
						}}
					>
						<TextField
							label="Name"
							isRequired
							autoFocus
							value={form.name}
							onChange={(value) => setFormData({ ...form, name: value })}
						/>
						<div className="grid grid-cols-6 gap-4">
							<Select
								className="col-span-2"
								label="Type"
								placeholder="Type"
								isRequired
								selectedKey={form.type}
								onSelectionChange={(key) =>
									setFormData({ ...form, type: key as CategoryType })
								}
							>
								<Select.Item id={CategoryType.EXPENSE}>Expense</Select.Item>
								<Select.Item id={CategoryType.INCOME}>Income</Select.Item>
							</Select>
							<div className="col-span-2 flex flex-col gap-2">
								<Label className="text-sm font-medium leading-none">
									Color
								</Label>
								<ColorPicker
									value={form.color}
									onChange={(value) => setFormData({ ...form, color: value })}
								/>
							</div>
							<div className="col-span-2 flex flex-col gap-2">
								<Label className="text-sm font-medium leading-none">
									Emoji
								</Label>
								<EmojiPicker
									value={form.emoji}
									onEmojiSelect={(emoji) => setFormData({ ...form, emoji })}
								/>
							</div>
						</div>
					</Form>
					<Modal.Footer>
						<Button onPress={close} type="button" variant="outline">
							Cancel
						</Button>
						<Button type="submit" form="form">
							Create Category
						</Button>
					</Modal.Footer>
				</>
			)}
		</Modal>
	);
};

export default function AppCategoriesPage() {
	const [tab, setTab] = React.useState("ALL");
	const [search, setSearch] = React.useState("");

	const [query] = useCategoriesQuery(
		tab === "ALL" ? undefined : (tab as CategoryType),
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
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="text-4xl">Categories</div>
					<div className="text-lg text-muted-foreground">
						Create and manage your transaction categories.
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Modal.Trigger>
						<Button>
							<Plus className="size-4" />
							New Category
						</Button>
						<CategoryModal />
					</Modal.Trigger>
				</div>
			</div>
			<div className="flex justify-between">
				<Tabs
					selectedKey={tab}
					onSelectionChange={(key) => setTab(key.toString())}
				>
					<Tabs.Nav className="self-start">
						<Tabs.NavItem id="ALL">All</Tabs.NavItem>
						<Tabs.NavItem id={CategoryType.EXPENSE}>Expense</Tabs.NavItem>
						<Tabs.NavItem id={CategoryType.INCOME}>Income</Tabs.NavItem>
					</Tabs.Nav>
				</Tabs>
				<SearchField
					value={search}
					onChange={setSearch}
					placeholder="Search Categories..."
				/>
			</div>
			<div id={tab} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{categories.map((cat) => (
					<Card
						key={cat.id}
						className="w-full transition-all hover:shadow-lg hover:-translate-y-1"
					>
						<Card.Content className="pt-5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 overflow-hidden">
									<span
										className="flex items-center justify-center size-10 min-w-10 text-xl rounded-xl"
										style={{ backgroundColor: cat.color }}
									>
										{cat.emoji}
									</span>
									<p className="text-xl font-medium truncate">{cat.name}</p>
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
						<Card.Footer className="flex justify-between items-center gap-3 py-3 rounded-b-md bg-secondary/50">
							<span className="font-medium text-sm truncate">
								{cat.transactions.length} Transactions
							</span>
							<span className="font-bold text-lg">
								{cat.transactions
									.reduce((sum, t) => sum + t.amount, 0)
									.toLocaleString("en-HK", {
										style: "currency",
										currency: "HKD",
									})}
							</span>
						</Card.Footer>
					</Card>
				))}
			</div>
		</main>
	);
}
