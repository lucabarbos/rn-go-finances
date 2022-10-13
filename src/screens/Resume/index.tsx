import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";

import { HistoryCard } from "../../components/HistoryCard";
import { ChartContainer, Container, Content, Header, Title } from "./styles";
import { categories } from "../../utils/categories";

interface TransactionData {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );

  async function loadData() {
    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter(
      (expensive: TransactionData) => expensive.type === "negative"
    );

    const totalExpensives = expensives.reduce(
      (acc: number, expensive: TransactionData) => {
        return acc + Number(expensive.amount);
      },
      0
    );

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expensives.forEach((expensive: TransactionData) => {
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      if (categorySum > 0) {
        const percent = `${((categorySum / totalExpensives) * 100).toFixed(
          0
        )}%`;

        totalByCategory.push({
          name: category.name,
          total: categorySum,
          totalFormatted: categorySum.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          color: category.color,
          percent,
        });
      }
    });

    setTotalByCategories(totalByCategory);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      <Content>
        <ChartContainer>
          <VictoryPie
            data={totalByCategories}
            colorScale={totalByCategories.map((category) => category.color)}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: "bold",
                fill: "white",
              },
            }}
            labelRadius={75}
            x="percent"
            y="total"
          />
        </ChartContainer>

        {totalByCategories.map((item) => (
          <HistoryCard
            amount={item.totalFormatted}
            color={item.color}
            title={item.name}
            key={item.name}
          />
        ))}
      </Content>
    </Container>
  );
}
