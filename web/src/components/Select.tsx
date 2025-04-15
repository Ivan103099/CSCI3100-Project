import * as Aria from "react-aria-components";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = <T extends object>({
	label,
	items,
	error,
	children,
	className,
	...props
}: Omit<Aria.SelectProps<T>, "children"> & {
	label?: string;
	items?: Iterable<T>;
	error?: string | ((validation: Aria.ValidationResult) => string);
	children: React.ReactNode | ((item: T) => React.ReactNode);
}) => (
	<Aria.Select
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	>
		<Aria.Label className="text-sm font-medium leading-none">
			{label}
		</Aria.Label>
		<Aria.Button
			className={cn(
				"flex h-10 w-full items-center justify-between px-3 py-2",
				"rounded-md text-sm border border-input bg-background ring-offset-background",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"focus-visible:outline-none cursor-pointer",
			)}
		>
			<Aria.SelectValue className="text-start line-clamp-1 data-[placeholder]:text-muted-foreground" />
			<ChevronDown aria-hidden="true" className="size-4 opacity-50" />
		</Aria.Button>
		<Aria.FieldError className="text-sm font-medium text-destructive">
			{error}
		</Aria.FieldError>
		<Aria.Popover
			offset={4}
			className="z-50 bg-popover text-popover-foreground border border-border rounded-md shadow-md outline-none w-(--trigger-width)"
		>
			<Aria.ListBox
				className="max-h-[inherit] overflow-auto p-1 outline-none"
				items={items}
			>
				{children}
			</Aria.ListBox>
		</Aria.Popover>
	</Aria.Select>
);

Select.Item = <T extends object>({
	className,
	children,
	...props
}: Aria.ListBoxItemProps<T>) => (
	<Aria.ListBoxItem
		className={cn(
			"relative flex items-center w-full py-1.5 px-8 rounded-sm text-sm",
			"cursor-pointer select-none outline-none",
			"hover:bg-accent hover:text-accent-foreground",
			className,
		)}
		{...props}
	>
		{Aria.composeRenderProps(children, (children, renderProps) => (
			<>
				{renderProps.isSelected && (
					<span className="absolute left-2 flex size-4 items-center justify-center">
						<Check className="size-4" />
					</span>
				)}
				{children}
			</>
		))}
	</Aria.ListBoxItem>
);

export default Select;
