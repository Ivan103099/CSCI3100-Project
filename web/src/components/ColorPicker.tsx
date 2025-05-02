import React from "react";
import * as Aria from "react-aria-components";

import { cn } from "@/lib/utils";

import Button from "./Button";
import Popover from "./Popover";

export const ColorPicker = ({
	value,
	onChange,
	...props
}: Aria.ColorPickerProps) => {
	const [selected, setSelected] = React.useState(value);
	return (
		<Aria.ColorPicker
			value={selected}
			onChange={(value) => {
				setSelected(value);
				onChange?.(value);
			}}
			{...props}
		>
			<Aria.DialogTrigger>
				<Button variant="outline" className="font-normal">
					<Aria.ColorSwatch className="size-6 rounded-md" />
					{selected?.toString("hex")}
				</Button>
				<Popover>
					<Aria.Dialog className="flex flex-col gap-3 p-3 outline-none">
						<Aria.ColorArea
							colorSpace="hsb"
							xChannel="saturation"
							yChannel="brightness"
							className="size-[192px] shrink-0 shadow-md rounded-md border border-border"
						>
							<Aria.ColorThumb
								className={cn(
									"z-10 box-border size-5 rounded-[50%] border-2 border-white shadow-md",
									"data-[focus-visible]:size-6",
								)}
							/>
						</Aria.ColorArea>
						<Aria.ColorSlider colorSpace="hsb" channel="hue">
							<Aria.SliderTrack className="h-7">
								<Aria.ColorThumb
									className={cn(
										"top-1/2 z-10 box-border size-5 rounded-[50%] border-2 border-white shadow-md",
										"data-[focus-visible]:size-6",
									)}
								/>
							</Aria.SliderTrack>
						</Aria.ColorSlider>
					</Aria.Dialog>
				</Popover>
			</Aria.DialogTrigger>
		</Aria.ColorPicker>
	);
};

export default ColorPicker;
