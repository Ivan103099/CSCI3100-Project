import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
    ChartConfig,
} from "@/components/Chart";
import { Pie } from 'recharts';
import { PieChart } from 'lucide-react';

// Function redefined from Chart.tsx
function getPayloadConfigFromPayload(
    config: ChartConfig,
    payload: unknown,
    key: string,
) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }

    const payloadPayload =
        "payload" in payload &&
        typeof payload.payload === "object" &&
        payload.payload !== null
            ? payload.payload
            : undefined;

    let configLabelKey: string = key;

    if (
        key in payload &&
        typeof payload[key as keyof typeof payload] === "string"
    ) {
        configLabelKey = payload[key as keyof typeof payload] as string;
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
    ) {
        configLabelKey = payloadPayload[
            key as keyof typeof payloadPayload
        ] as string;
    }

    return configLabelKey in config
        ? config[configLabelKey]
        : config[key as keyof typeof config];
}

jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    Tooltip: (props: any) => <div data-testid="recharts-tooltip" {...props} />,
    Legend: (props: any) => <div data-testid="recharts-legend" {...props} />,
    PieChart: ({ children, ...props }: any) => (
        <div data-testid="recharts-pie-chart" {...props}>{children}</div>
      ),
    Pie: ({ data, ...props }: any) => (
        <div 
            data-testid="recharts-pie" 
            data={typeof data === 'object' ? JSON.stringify(data) : data}
            {...props} 
        />
    )
}));

describe('Chart Components', () => {
    const mockConfig = {
        income: {
          label: "Income",
          color: "#10b981",
        },
        expense: {
          label: "Expense",
          theme: {
            light: "#ef4444",
            dark: "#f87171",
          },
        },
    };

    it("renders correctly with responsive container", () => {
        render(
          <ChartContainer config={mockConfig} data-testid="chart-container">
            <div data-testid="chart-child">Chart Content</div>
          </ChartContainer>
        );
        
        expect(screen.getByTestId("chart-container")).toBeInTheDocument();
        expect(screen.getByTestId("recharts-responsive-container")).toBeInTheDocument();
        expect(screen.getByTestId("chart-child")).toHaveTextContent("Chart Content");
    });

    describe('ChartTooltip', () => {
        const mockPayload = [
            {
              dataKey: "income",
              name: "Income",
              value: 5000,
              color: "#10b981",
              payload: { income: 5000 },
            },
        ];

        it("renders nothing when not active", () => {
            const { container } = render(
              <ChartContainer config={mockConfig}>
                <ChartTooltipContent active={false} payload={mockPayload} />
              </ChartContainer>
            );
            
            expect(container.firstChild).not.toBeNull();
            expect(container.querySelector("[class*='rounded-lg']")).toBeNull();
        });

        it("renders tooltip content when active", () => {
            render(
              <ChartContainer config={mockConfig} data-testid="tooltip">
                <ChartTooltipContent active={true} payload={mockPayload} />
              </ChartContainer>
            );
            
            const tooltip = screen.getByTestId("tooltip");
            expect(tooltip).toBeInTheDocument();
            expect(tooltip).toHaveTextContent("Income");
            expect(tooltip).toHaveTextContent("HK$5,000.00");
        });

        it("applies custom formatter and hide indicator", () => {
            const formatter = jest.fn(() => <span data-testid="custom-format">Custom</span>);
            
            const { container } = render(
              <ChartContainer config={mockConfig}>
                <ChartTooltipContent 
                  active={true} 
                  payload={mockPayload} 
                  formatter={formatter} 
                  hideIndicator={true}
                />
              </ChartContainer>
            );
            
            expect(formatter).toHaveBeenCalled();
            expect(screen.getByTestId("custom-format")).toBeInTheDocument();

            const tooltip = container.querySelector("[class*='rounded-lg']");
            const indicators = tooltip?.querySelectorAll("[class*='rounded-[2px]']");
            expect(indicators?.length).toBe(0);
        });
    });

    describe('ChartLegend', () => {
        const mockPayload = [
            {
              dataKey: "income",
              value: "Income",
              color: "#10b981",
            },
            {
              dataKey: "expense",
              value: "Expense",
              color: "#ef4444",
            },
        ];

        it("renders legend items correctly", () => {
            render(
                <ChartContainer config={mockConfig} data-testid="legend">
                    <ChartLegendContent payload={mockPayload} />
                </ChartContainer>
            );

            expect(screen.getByTestId("legend")).toBeInTheDocument();
            expect(screen.getByText("Income")).toBeInTheDocument();
            expect(screen.getByText("Expense")).toBeInTheDocument();
        });


    });
});

describe('Chart', () => {
    const mockData = [
        { category: 'Food', amount: 500, fill: '#FF5733' },
        { category: 'Transport', amount: 300, fill: '#33FF57' },
        { category: 'Entertainment', amount: 200, fill: '#5733FF' },
    ];

    const mockConfig = {
        Food: { label: 'Food' },
        Transport: { label: 'Transport' },
        Entertainment: { label: 'Entertainment' },
    };

    it('render PieChart with data correctly', () => {
        render(
            <ChartContainer 
                config={mockConfig}
                className="mx-auto aspect-square max-h-[400px]"
                data-testid="chart-container"
            >
                <PieChart data-testid="recharts-pie-chart">
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel data-testid="tooltip-content" />}
                    />
                    <Pie data={mockData} dataKey="amount" nameKey="category" />
                    <ChartLegend
                        content={<ChartLegendContent nameKey="category" data-testid="legend-content" />}
                        className="-translate-y-2 flex-wrap gap-2"
                    />
                </PieChart>
            </ChartContainer>
        )

        expect(screen.getByTestId("recharts-pie-chart")).toBeInTheDocument();
        expect(screen.getByTestId("recharts-pie")).toBeInTheDocument();

        const pieElement = screen.getByTestId("recharts-pie");
        expect(pieElement).toHaveAttribute('dataKey', 'amount');
        expect(pieElement).toHaveAttribute('nameKey', 'category');
        expect(pieElement).toHaveAttribute('data', JSON.stringify(mockData));
        const parsedData = JSON.parse(pieElement.getAttribute('data') || '[]');
        expect(parsedData).toEqual(mockData);
    });
});

describe('getPayloadConfigFromPayload', () => {
    const mockConfig: ChartConfig = {
        food: { 
          label: "Food", 
          color: "#FF5733" 
        },
        transport: { 
          label: "Transport", 
          color: "#33FF57" 
        },
        entertainment: { 
          label: "Entertainment", 
          color: "#5733FF" 
        },
        category: {
          label: "Default Category",
          color: "#cccccc"
        }
    };

    it('return underfined when payload is not an object', () => {
        const result = getPayloadConfigFromPayload(mockConfig, "string", "food");
        expect(result).toBeUndefined();
    });

    it('return undefined when payload is null', () => {
        const result = getPayloadConfigFromPayload(mockConfig, null, "food");
        expect(result).toBeUndefined();
    });

    it('should return config for the key when payload does not have that key', () => {
        const payload = { value: 500 };
        const result = getPayloadConfigFromPayload(mockConfig, payload, 'food');
        expect(result).toEqual({ label: "Food", color: "#FF5733" });
    });
    
    it('should use payload[key] as configLabelKey when it exists and is a string', () => {
        const payload = { category: 'transport', value: 300 };
        const result = getPayloadConfigFromPayload(mockConfig, payload, 'category');
        expect(result).toEqual({ label: "Transport", color: "#33FF57" });
    });
});