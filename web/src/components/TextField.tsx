import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

const TextField = ({
	label,
	prefix,
	placeholder,
	description,
	error,
	className,
	...props
}: Aria.TextFieldProps & {
	label?: string;
	prefix?: string;
	placeholder?: string;
	description?: string;
	error?: string | ((validation: Aria.ValidationResult) => string);
}) => (
	<Aria.TextField
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	>
		<Aria.Label className="text-sm font-medium leading-none disabled:cursor-not-allowed disabled:opacity-70">
			{label}
		</Aria.Label>
		{/* {prefix && (
			<span className="absolute left-3 top-1/2 text-muted-foreground font-medium">
				{prefix}
			</span>
		)} */}
		<Aria.Input
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
				"group-data-[invalid]:border-destructive",
				// prefix && "pl-7",
			)}
			placeholder={placeholder}
		/>
		{description && (
			<Aria.Text className="text-sm text-muted-foreground" slot="description">
				{description}
			</Aria.Text>
		)}
		<Aria.FieldError className="text-sm font-medium text-destructive">
			{error}
		</Aria.FieldError>
	</Aria.TextField>
);

export default TextField;
