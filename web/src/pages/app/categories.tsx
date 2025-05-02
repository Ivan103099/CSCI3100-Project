import React from "react";
import { Label, Form, parseColor } from "react-aria-components";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import type { CategoryType } from "@/lib/models";
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

const CategoryModal = () => {
	const init = {
		name: "",
		emoji: "☺️",
		color: parseColor("#000000"),
		type: "EXPENSE" as CategoryType,
	};
	const [form, setFormData] = React.useState(init);

	const [, createCategory] = useCreateCategoryMutation();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		createCategory({
			name: form.name,
			emoji: form.emoji,
			color: form.color.toString("hex"),
			type: form.type,
		}).then(({ error, data }) => {
			if (error)
				toasts.add(
					{
						title: "Category Create Failed",
						description: error.message,
						variant: "destructive",
					},
					{ timeout: 5000 },
				);
			else
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
						<Modal.Description className="text-sm text-muted-foreground">
							Fill in the details of your new category.
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
						<div className="grid grid-cols-6 gap-4">
							<Select
								label="Type"
								placeholder="Type"
								className="col-span-2"
								isRequired
								selectedKey={form.type}
								onSelectionChange={(key) =>
									setFormData({ ...form, type: key as CategoryType })
								}
							>
								<Select.Item id="EXPENSE">Expense</Select.Item>
								<Select.Item id="INCOME">Income</Select.Item>
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
									onEmojiSelect={({ emoji }) => setFormData({ ...form, emoji })}
								/>
							</div>
						</div>
						<TextField
							label="Name"
							isRequired
							value={form.name}
							onChange={(value) => setFormData({ ...form, name: value })}
						/>
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
			<div className="flex items-center justify-between px-2 pb-2">
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
										<span
											className="flex items-center justify-center size-10 min-w-10 rounded-xl text-xl"
											style={{ backgroundColor: category.color }}
										>
											{category.emoji}
										</span>
										<p className="text-xl font-medium">{category.name}</p>
									</div>
									<Menu.Trigger>
										<Button
											variant="ghost"
											className="absolute right-5 p-2 h-5"
										>
											<MoreHorizontal className="size-4" />
										</Button>
										<Menu className="min-w-28">
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
