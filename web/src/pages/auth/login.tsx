import { useState } from "react";
import { useNavigate } from "react-router";
import { Form } from "react-aria-components";

import { useLoginMutation } from "@/lib/client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { toasts } from "@/components/Toast";

export default function AuthLoginPage() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const mutationLogin = useLoginMutation();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutationLogin.mutate(
			{ email, password },
			{
				onSuccess: () => navigate("/"),
				onError: ({ message }) =>
					toasts.add(
						{
							title: "Login Failed",
							description: message,
							variant: "destructive",
						},
						{ timeout: 3000 },
					),
			},
		);
	};

	return (
		<Card className="w-full max-w-sm">
			<Card.Header className="h-30 mb-1 p-0 items-center justify-center">
				<span className="text-3xl font-bold font-display tracking-tight">
					FINAWISE
				</span>
			</Card.Header>
			<Card.Content>
				<Form className="space-y-5" onSubmit={handleSubmit}>
					<TextField
						type="email"
						label="Email"
						isRequired
						value={email}
						onChange={setEmail}
						placeholder="name@example.com"
					/>
					<TextField
						type="password"
						label="Password"
						isRequired
						value={password}
						onChange={setPassword}
					/>
					<Button type="submit" className="w-full">
						Login
					</Button>
				</Form>
			</Card.Content>
			<Card.Footer className="flex-col gap-5">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onPress={() => navigate("/register")}
				>
					Register
				</Button>
				<span className="block text-sm text-center">
					Forgot your password?
					<Button
						variant="link"
						className="w-0 h-0 ml-2"
						onPress={() => navigate("/reset")}
					>
						Reset
					</Button>
				</span>
			</Card.Footer>
		</Card>
	);
}
