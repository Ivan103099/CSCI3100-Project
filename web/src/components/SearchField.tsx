import * as Aria from "react-aria-components";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

const SearchField = ({
	label,
	description,
	placeholder = "Search...",
	error,
	className,
	...props
}: Aria.SearchFieldProps & {
	label?: string;
	description?: string;
	placeholder?: string;
	error?: string | ((validation: Aria.ValidationResult) => string);
}) => (
	<Aria.SearchField
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	>
		{label && (
			<Aria.Label className="text-sm font-medium leading-none disabled:cursor-not-allowed disabled:opacity-70">
				{label}
			</Aria.Label>
		)}
		<Aria.Group
			className={cn(
				"relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
				"focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				"disabled:opacity-50",
				className,
			)}
		>
			<Search aria-hidden className="size-4 text-muted-foreground" />
			<Aria.Input
				className={cn(
					"flex-1 h-10 outline-0 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"[&::-webkit-search-cancel-button]:hidden",
				)}
				placeholder={placeholder}
			/>
			<Aria.Button
				className={cn(
					"rounded-sm opacity-70 ring-offset-background transition-opacity cursor-pointer",
					"hover:opacity-100 disabled:pointer-events-none group-data-[empty]:invisible",
				)}
			>
				<X aria-hidden className="size-4" />
			</Aria.Button>
		</Aria.Group>
		{description && (
			<Aria.Text className="text-sm text-muted-foreground" slot="description">
				{description}
			</Aria.Text>
		)}
		<Aria.FieldError className="text-sm font-medium text-destructive">
			{error}
		</Aria.FieldError>
	</Aria.SearchField>
);

export default SearchField;
