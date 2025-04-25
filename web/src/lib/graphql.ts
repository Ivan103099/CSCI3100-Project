import {
	Client,
	cacheExchange,
	fetchExchange,
	gql,
	useQuery,
	useMutation,
} from "urql";

import type {
	Account,
	AccountSummary,
	Category,
	Transaction,
	TxnType,
} from "./models";
import { BASE_URL } from "./client";

export const client = new Client({
	url: new URL("graphql", BASE_URL).toString(),
	exchanges: [cacheExchange, fetchExchange],
	fetchOptions: () => ({ credentials: "include" }),
});

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

export const useCategoriesQuery = (tt?: TxnType) =>
	useQuery<{
		categories: (Category & {
			transactions: Transaction[];
		})[];
	}>({
		query: gql`
      query ($tt: TxnType) {
        categories(tt: $tt) {
          id
          type
          name
          transactions {
            id
            title
            amount
            timestamp
          }
        }
      }
    `,
		variables: { tt },
	});

export const useTransactionsQuery = (tt?: TxnType) =>
	useQuery<{
		transactions: (Transaction & {
			category: Category;
		})[];
	}>({
		query: gql`
      query ($tt: TxnType) {
        transactions(tt: $tt) {
          id
          title
          amount
          timestamp
          category {
            id
            name
            type
          }
        }
      }
    `,
		variables: { tt },
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
