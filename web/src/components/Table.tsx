import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

const Table = ({ className, ...props }: Aria.TableProps) => (
	<Aria.Table className={cn("w-full text-sm", className)} {...props} />
);

Table.Header = <T extends object>({
	className,
	...props
}: Aria.TableHeaderProps<T>) => (
	<Aria.TableHeader
		className={cn("[&_tr]:border-b-2 [&_tr]:border-border", className)}
		{...props}
	/>
);

Table.Column = ({ className, children, ...props }: Aria.ColumnProps) => (
	<Aria.Column
		className={cn(
			"p-4 text-left align-middle font-medium text-muted-foreground",
			className,
		)}
		{...props}
	>
		{children}
	</Aria.Column>
);

Table.Body = <T extends object>({
	className,
	...props
}: Aria.TableBodyProps<T>) => (
	<Aria.TableBody
		className={cn(
			"[&_tr:last-child]:border-0",
			"empty:h-24 empty:text-center empty:text-muted-foreground",
			className,
		)}
		{...props}
	/>
);

Table.Row = <T extends object>({ className, ...props }: Aria.RowProps<T>) => (
	<Aria.Row
		className={cn(
			"border-b border-border transition-colors",
			props.onAction &&
				"cursor-pointer hover:bg-accent hover:text-accent-foreground",
			className,
		)}
		{...props}
	/>
);

Table.Cell = ({ className, ...props }: Aria.CellProps) => (
	<Aria.Cell className={cn("p-4 align-middle", className)} {...props} />
);

export default Table;
