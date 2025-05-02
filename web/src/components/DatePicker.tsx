import * as Aria from "react-aria-components";
import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import Button from "./Button";

const Calendar = <T extends Aria.DateValue>({
	className,
	...props
}: Aria.CalendarProps<T>) => (
	<Aria.Calendar className={cn("w-fit", className)} {...props}>
		<header className="flex w-full items-center gap-1 px-1 pb-4">
			<Aria.Button
				slot="previous"
				className={cn(
					Button.variants({ variant: "outline" }),
					"size-7 bg-transparent p-0 opacity-50",
					"hover:opacity-100",
				)}
			>
				<ChevronLeft aria-hidden className="size-4" />
			</Aria.Button>
			<Aria.Heading className="grow text-center text-sm font-medium" />
			<Aria.Button
				slot="next"
				className={cn(
					Button.variants({ variant: "outline" }),
					"size-7 bg-transparent p-0 opacity-50",
					"hover:opacity-100",
				)}
			>
				<ChevronRight aria-hidden className="size-4" />
			</Aria.Button>
		</header>
		<Aria.CalendarGrid className="border-separate border-spacing-x-0 border-spacing-y-1">
			<Aria.CalendarGridHeader>
				{(day) => (
					<Aria.CalendarHeaderCell className="w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground">
						{day}
					</Aria.CalendarHeaderCell>
				)}
			</Aria.CalendarGridHeader>
			<Aria.CalendarGridBody className="[&>tr>td]:p-0">
				{(date) => <Calendar.Cell date={date} />}
			</Aria.CalendarGridBody>
		</Aria.CalendarGrid>
	</Aria.Calendar>
);

Calendar.Cell = ({ className, ...props }: Aria.CalendarCellProps) => (
	<Aria.CalendarCell
		className={Aria.composeRenderProps(className, (className, renderProps) =>
			cn(
				Button.variants({ variant: "ghost" }),
				"relative flex size-9 items-center justify-center p-0 text-sm font-normal",
				renderProps.isDisabled && "text-muted-foreground opacity-50",
				renderProps.isSelected &&
					"bg-primary text-primary-foreground data-[focused]:bg-primary  data-[focused]:text-primary-foreground",
				renderProps.isOutsideMonth &&
					"text-muted-foreground opacity-50 data-[selected]:bg-accent/50 data-[selected]:text-muted-foreground data-[selected]:opacity-30",
				renderProps.date.compare(today(getLocalTimeZone())) === 0 &&
					!renderProps.isSelected &&
					"bg-accent text-accent-foreground",
				renderProps.isUnavailable && "cursor-default text-destructive ",
				renderProps.isInvalid &&
					"bg-destructive text-destructive-foreground data-[focused]:bg-destructive data-[hovered]:bg-destructive data-[focused]:text-destructive-foreground data-[hovered]:text-destructive-foreground",
				className,
			),
		)}
		{...props}
	/>
);

const DatePicker = <T extends Aria.DateValue>({
	label,
	description,
	className,
	...props
}: Aria.DatePickerProps<T> & {
	label?: string;
	description?: string;
}) => (
	<Aria.DatePicker
		className={cn("group flex flex-col gap-2", className)}
		{...props}
	>
		<Aria.Label className="text-sm font-medium leading-none">
			{label}
		</Aria.Label>
		<Aria.Group
			className={cn(
				"relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background pl-3 py-2 text-sm ring-offset-background",
				"data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
				"data-[disabled]:opacity-50",
			)}
		>
			<Aria.DateInput className="text-sm flex-1">
				{(segment) => (
					<Aria.DateSegment
						segment={segment}
						className={cn(
							"type-literal:px-0 inline rounded p-0.5 caret-transparent outline-0",
							"data-[placeholder]:text-muted-foreground",
							"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
							"data-[focused]:bg-accent data-[focused]:text-accent-foreground",
							"data-[invalid]:data-[focused]:bg-destructive data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive",
						)}
					/>
				)}
			</Aria.DateInput>
			<Button
				size="icon"
				variant="ghost"
				className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
			>
				<CalendarIcon aria-hidden className="size-4" />
			</Button>
		</Aria.Group>
		{description && (
			<Aria.Text className="text-sm text-muted-foreground" slot="description">
				{description}
			</Aria.Text>
		)}
		<Content>
			<Calendar />
		</Content>
	</Aria.DatePicker>
);

export default DatePicker;
