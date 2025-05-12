import React from "react";
import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

const Progress = ({
	label,
	value,
	max,
	fill,
	className,
	...props
}: React.ComponentProps<"div"> & {
	label: string;
	value: number;
	max: number;
	fill?: string;
}) => {
	const percentage = React.useMemo(() => {
		if (max === 0) return 0;
		return Math.floor((value / max) * 100);
	}, [value, max]);
	return (
		<div className={cn("w-full flex flex-col gap-2", className)} {...props}>
			<div className="flex w-full justify-between">
				<Aria.Label className="text-sm font-medium leading-none">
					{label}
				</Aria.Label>
				<span className="text-sm font-medium leading-none">{`${percentage}%`}</span>
			</div>
			<div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
				<div
					className={cn("size-full flex-1 bg-primary transition-all", fill)}
					style={{
						transform: `translateX(-${100 - (percentage ?? 0)}%)`,
					}}
				/>
			</div>
		</div>
	);
};

export default Progress;
