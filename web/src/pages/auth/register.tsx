import { useState } from "react";
import { useNavigate } from "react-router";
import { Form } from "react-aria-components";
import { ChevronLeft } from "lucide-react";

import { useRegisterRequest } from "@/lib/client";

import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { toasts } from "@/components/Toast";

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AuthRegisterPage() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullname, setFullname] = useState("");
	const [key, setKey] = useState("");

	const requestRegister = useRegisterRequest();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		requestRegister({
			email,
			password,
			fullname,
			key,
		})
			.then(() => {
				toasts.add(
					{
						title: "Register Success",
						description: "Welcome to Finawise!",
						variant: "success",
					},
					{ timeout: 5000 },
				);
				navigate("/login");
			})
			.catch(({ message }) =>
				toasts.add(
					{
						title: "Register Failed",
						description: message,
						variant: "destructive",
					},
					{ timeout: 5000 },
				),
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
						placeholder="name@example.com"
						isRequired
						value={email}
						onChange={setEmail}
					/>
					<TextField
						type="password"
						label="Password"
						isRequired
						value={password}
						onChange={setPassword}
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
						onChange={setFullname}
					/>
					<TextField
						type="text"
						label="License Key"
						isRequired
						value={key}
						validate={(value) =>
							!UUID_REGEX.test(value) ? "Invalid license key format." : null
						}
						onChange={(value) => setKey(value.toLowerCase())}
					/>
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
