import {
	Client,
	cacheExchange,
	fetchExchange,
	mapExchange,
	gql,
	useQuery,
	useMutation,
} from "urql";
import { getDefaultStore } from "jotai";

import type {
	Account,
	AccountSummary,
	Category,
	Transaction,
	CategoryType,
} from "./models";
import { BASE_URL, $account } from "./client";

const store = getDefaultStore();

// TODO: recreate client when logout
let client: Client;

export const createClient = () => {
	client = new Client({
		url: new URL("graphql", BASE_URL).toString(),
		exchanges: [
			cacheExchange,
			mapExchange({
				onError(_error) {
					createClient();
					store.set($account, undefined);
				},
			}),
			fetchExchange,
		],
		fetchOptions: () => ({ credentials: "include" }),
	});
	return client;
};

export const useAccountQuery = () =>
	useQuery<{ account: Account }>({
		query: gql`
      query {
        account {
          email
          fullname
        }
      }
    `,
	});

export const useAccountSummaryQuery = () =>
	useQuery<{ account: { summary: AccountSummary } }>({
		query: gql`
      query {
        account {
          summary {
            balance
            income
            expense
            # budget
          }
        }
      }
    `,
	});

export const useCategoriesQuery = (type?: CategoryType) =>
	useQuery<{
		categories: (Category & {
			transactions: Transaction[];
		})[];
	}>({
		query: gql`
      query ($type: CategoryType) {
        categories(ct: $type) {
          id
          type
          name
          emoji
          color
          transactions {
            id
            title
            amount
            timestamp
          }
        }
      }
    `,
		variables: { type },
	});

export const useTransactionsQuery = (type?: CategoryType) =>
	useQuery<{
		transactions: (Transaction & {
			category: Category;
		})[];
	}>({
		query: gql`
      query ($type: CategoryType) {
        transactions(ct: $type) {
          id
          title
          amount
          timestamp
          category {
            id
            name
            type
            emoji
            color
          }
        }
      }
    `,
		variables: { type },
	});

export const useCreateAccountMutation = () =>
	useMutation<{ createAccount: { id: number } }>(gql`
    mutation ($email: String!, $password: String!, $fullname: String!) {
      createAccount(a: {
        email: $email
        password: $password
        fullname: $fullname
      }) {
        id
      }
    }
  `);

export const useCreateCategoryMutation = () =>
	useMutation<{ createCategory: { id: string } }>(gql`
    mutation ($name: String!, $type: CategoryType!, $emoji: String!, $color: String!) {
      createCategory(c: {
        name: $name
        type: $type
        emoji: $emoji
        color: $color
      }) {
        id
      }
    }
  `);

export const useCreateTransactionMutation = () =>
	useMutation<{ createTransaction: { id: string } }>(gql`
    mutation ($cid: ULID!, $amount: Float!, $timestamp: Timestamp!, $title: String!) {
      createTransaction(t: {
        cid: $cid
        amount: $amount
        timestamp: $timestamp
        title: $title
      }) {
        id
      }
    }
  `);
