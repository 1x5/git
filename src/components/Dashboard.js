import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex } from '@chakra-ui/react';

const Dashboard = ({ statistics, categories }) => {
  const formatCurrency = (value) => {
    return `${value.toFixed(2)} ₽`;
  };

  // Вычисляем изменение расходов по сравнению с предыдущим месяцем
  const getCurrentMonthChange = () => {
    if (!statistics || !statistics.monthlyTotals) return { value: 0, isIncrease: false };
    
    const months = Object.keys(statistics.monthlyTotals).sort();
    
    if (months.length < 2) return { value: 0, isIncrease: false };
    
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];
    
    const currentAmount = statistics.monthlyTotals[currentMonth] || 0;
    const previousAmount = statistics.monthlyTotals[previousMonth] || 0;
    
    if (previousAmount === 0) return { value: 100, isIncrease: true };
    
    const changePercent = ((currentAmount - previousAmount) / previousAmount) * 100;
    
    return {
      value: Math.abs(changePercent),
      isIncrease: changePercent > 0
    };
  };

  const monthChange = getCurrentMonthChange();

  return (
    <Box className="glass-card" p={6}>
      <Heading size="lg" mb={6} color="white" textShadow="0 2px 4px rgba(0,0,0,0.1)">
        Обзор расходов
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat bg="rgba(255, 255, 255, 0.1)" p={4} borderRadius="lg" backdropFilter="blur(5px)">
          <StatLabel color="white">Общие расходы</StatLabel>
          <StatNumber color="white">{formatCurrency(statistics?.totalAmount || 0)}</StatNumber>
          <StatHelpText color="whiteAlpha.800">За все время</StatHelpText>
        </Stat>
        
        <Stat bg="rgba(255, 255, 255, 0.1)" p={4} borderRadius="lg" backdropFilter="blur(5px)">
          <StatLabel color="white">Текущий месяц</StatLabel>
          <StatNumber color="white">{formatCurrency(statistics?.currentMonthAmount || 0)}</StatNumber>
          <StatHelpText color="whiteAlpha.800">
            <Flex alignItems="center">
              <StatArrow type={monthChange.isIncrease ? 'increase' : 'decrease'} />
              {monthChange.value.toFixed(1)}% по сравнению с прошлым месяцем
            </Flex>
          </StatHelpText>
        </Stat>
        
        <Stat bg="rgba(255, 255, 255, 0.1)" p={4} borderRadius="lg" backdropFilter="blur(5px)">
          <StatLabel color="white">Категории</StatLabel>
          <StatNumber color="white">{categories?.length || 0}</StatNumber>
          <StatHelpText color="whiteAlpha.800">Активных категорий</StatHelpText>
        </Stat>
        
        <Stat bg="rgba(255, 255, 255, 0.1)" p={4} borderRadius="lg" backdropFilter="blur(5px)">
          <StatLabel color="white">Средний расход</StatLabel>
          <StatNumber color="white">
            {formatCurrency(
              statistics?.totalAmount && categories?.length
                ? statistics.totalAmount / categories.length
                : 0
            )}
          </StatNumber>
          <StatHelpText color="whiteAlpha.800">На категорию</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;