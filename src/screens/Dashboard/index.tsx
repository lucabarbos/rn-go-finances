import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCardProps,
  TransactionCard,
} from "../../components/TransactionCard";
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
} from "./styles";
import { useFocusEffect } from "@react-navigation/native";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensive: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  async function loadTransactions() {
    const collectionKey = "@gofinances:transactions";

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

      setHighlightData({
        entries: {
          amount: entriesTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        },
        expensive: {
          amount: expensiveTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        },
        total: {
          amount: (entriesTotal - expensiveTotal).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        },
      });

      setTransactions(transactionsFormatted);
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
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo source={{ uri: "http://github.com/lucabarbos.png" }} />

            <User>
              <UserGreeting>Olá,</UserGreeting>
              <UserName>Lucas</UserName>
            </User>
          </UserInfo>

          <LogoutButton onPress={() => {}}>
            <Icon name="power" />
          </LogoutButton>
        </UserWrapper>
      </Header>

      <HighlightCards>
        <HighlightCard
          title="Entradas"
          amount={highlightData.entries?.amount}
          lastTransaction="Última entrada dia 13 de abril"
          type="up"
        />
        <HighlightCard
          title="Saídas"
          amount={highlightData.expensive?.amount}
          lastTransaction="Última saída dia 03 de abril"
          type="down"
        />
        <HighlightCard
          title="Total"
          amount={highlightData.total?.amount}
          lastTransaction="01 à 16 de abril"
          type="total"
        />
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  );
}
