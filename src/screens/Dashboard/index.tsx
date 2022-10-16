import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
  TransactionListEmpty,
} from "./styles";

import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCardProps,
  TransactionCard,
} from "../../components/TransactionCard";

import { useAuth } from "../../hooks/auth";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensive: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  const theme = useTheme();

  const { signOut, user } = useAuth();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: "positive" | "negative"
  ) {
    const collectionFiltered = collection.filter((c) => c.type === type);

    if (collectionFiltered.length === 0) {
      return 0;
    }

    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collectionFiltered.map((transaction) =>
          new Date(transaction.date).getTime()
        )
      )
    );

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
      "pt-BR",
      { day: "2-digit", month: "long" }
    )}`;
  }

  async function loadTransactions() {
    const collectionKey = `@gofinances:transactions_user:${user.id}`;

    try {
      const data = await AsyncStorage.getItem(collectionKey);
      const transactions = data ? JSON.parse(data) : [];

      let entriesTotal = 0;
      let expensiveTotal = 0;

      const transactionsFormatted: DataListProps[] = transactions.map(
        (transaction: DataListProps) => {
          if (transaction.type === "positive") {
            entriesTotal += Number(transaction.amount);
          } else {
            expensiveTotal += Number(transaction.amount);
          }

          return {
            id: transaction.id,
            type: transaction.type,
            name: transaction.name,
            amount: Number(transaction.amount).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
            category: transaction.category,
            date: new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }).format(new Date(transaction.date)),
          };
        }
      );

      setTransactions(transactionsFormatted);

      const lastTransactionEntries = getLastTransactionDate(
        transactions,
        "positive"
      );

      const lastTransactionExpensives = getLastTransactionDate(
        transactions,
        "negative"
      );

      const totalInterval =
        lastTransactionExpensives === 0
          ? "Não há transações cadastradas"
          : `01 à ${lastTransactionExpensives}`;

      setHighlightData({
        entries: {
          amount: entriesTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          lastTransaction:
            lastTransactionEntries === 0
              ? "Não há transações cadastradas"
              : `Última entrada dia ${lastTransactionEntries}`,
        },
        expensive: {
          amount: expensiveTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          lastTransaction:
            lastTransactionExpensives === 0
              ? "Não há transações cadastradas"
              : `Última saída dia ${lastTransactionExpensives}`,
        },
        total: {
          amount: (entriesTotal - expensiveTotal).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          lastTransaction: totalInterval,
        },
      });

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saídas"
              amount={highlightData.expensive.amount}
              lastTransaction={highlightData.expensive.lastTransaction}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightData.total?.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
              ListEmptyComponent={
                <TransactionListEmpty>
                  Não há transações cadastradas
                </TransactionListEmpty>
              }
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
