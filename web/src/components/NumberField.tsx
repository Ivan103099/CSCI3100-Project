import * as Aria from "react-aria-components";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

import Button from "@/components/Button";

const NumberField = ({
	label,
	description,
	placeholder,
	error,
	className,
	...props
}: Aria.NumberFieldProps & {
	label?: string;
	description?: string;
	placeholder?: string;
	error?: string | ((validation: Aria.ValidationResult) => string);
}) => (
	<Aria.NumberField
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	>
		{label && (
			<Aria.Label className="text-sm font-medium leading-none disabled:cursor-not-allowed disabled:opacity-70">
				{label}
			</Aria.Label>
		)}
		<Aria.Group className="relative flex w-full items-center">
			<Aria.Input
				className={cn(
					"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
					"group-data-[invalid]:border-destructive",
				)}
				placeholder={placeholder}
			/>
			<div className="absolute right-0 flex h-full flex-col border-l border-border">
				<Button
					className="w-auto grow rounded-none px-0.5 text-muted-foreground"
					variant="ghost"
					size="icon"
					slot="increment"
				>
					<ChevronUp aria-hidden className="size-4" />
				</Button>
				<div className="border-border border-b" />
				<Button
					className="w-auto grow rounded-none px-0.5 text-muted-foreground"
					variant="ghost"
					size="icon"
					slot="decrement"
				>
					<ChevronDown aria-hidden className="size-4" />
				</Button>
			</div>
		</Aria.Group>
		{description && (
			<Aria.Text className="text-sm text-muted-foreground" slot="description">
				{description}
			</Aria.Text>
		)}
		<Aria.FieldError className="text-sm font-medium text-destructive">
			{error}
		</Aria.FieldError>
	</Aria.NumberField>
);

export default NumberField;
