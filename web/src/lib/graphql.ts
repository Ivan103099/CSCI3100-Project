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
	Budget,
	Category,
	CategoryType,
	Transaction,
} from "./models";
import { BASE_URL, $account } from "./client";

const store = getDefaultStore();

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
			budget?: Budget;
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
          budget {
            amount
          }
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

export const useBudgetsQuery = () =>
	useQuery<{
		budgets: (Budget & {
			category: Category & {
				transactions: Transaction[];
			};
		})[];
	}>({
		query: gql`
      query {
        budgets {
          amount
          category {
            id
            name
            type
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
      }
    `,
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

export const useCreateBudgetMutation = () =>
	useMutation<{ createBudget: { category: { id: string } } }>(gql`
    mutation ($cid: ULID!, $amount: Float!) {
      createBudget(b: {
        cid: $cid
        amount: $amount
      }) {
        category {
          id
        }
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
