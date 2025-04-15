import { useState } from "react";
import { useNavigate } from "react-router";
import { Form } from "react-aria-components";
import { ChevronLeft } from "lucide-react";

import { useRegisterMutation } from "@/lib/client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { toasts } from "@/components/Toast";

export default function AuthRegisterPage() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullname, setFullname] = useState("");

	const mutationRegister = useRegisterMutation();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutationRegister.mutate(
			{
				email,
				password,
				fullname,
			},
			{
				onSuccess: () => {
					toasts.add(
						{
							title: "Register Success",
							description: "Welcome to Finawise!",
							variant: "success",
						},
						{ timeout: 3000 },
					);
					navigate("/login");
				},
				onError: ({ message }) =>
					toasts.add(
						{
							title: "Register Failed",
							description: message,
							variant: "destructive",
						},
						{ timeout: 3000 },
					),
			},
		);
	};

	return (
		<Card className="w-full max-w-md">
			<Card.Header className="mb-5">
				<Card.Title>Create Account</Card.Title>
			</Card.Header>
			<Card.Content>
				<Form className="space-y-5" onSubmit={handleSubmit}>
					<TextField
						type="email"
						label="Email"
						isRequired
						value={email}
						onInput={(e) => setEmail(e.currentTarget.value)}
						placeholder="name@example.com"
					/>
					<TextField
						type="password"
						label="Password"
						isRequired
						value={password}
						onInput={(e) => setPassword(e.currentTarget.value)}
					/>
					<TextField
						type="password"
						label="Confirm Password"
						isRequired
						validate={(value) =>
							value !== password ? "Passwords do not match." : null
						}
					/>
					<TextField
						type="text"
						label="Full Name"
						isRequired
						value={fullname}
						onInput={(e) => setFullname(e.currentTarget.value)}
					/>
					<TextField type="text" label="License Key" isRequired />
					<Button type="submit" className="w-full">
						Register
					</Button>
				</Form>
			</Card.Content>
			<Card.Footer className="flex justify-center">
				<Button
					variant="link"
					className="p-0"
					onPress={() => navigate("/login")}
				>
					<ChevronLeft className="size-4" />
					Back to Login
				</Button>
			</Card.Footer>
		</Card>
	);
}
