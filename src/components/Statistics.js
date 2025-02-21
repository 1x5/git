import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
} from '@chakra-ui/react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Statistics = ({ statistics, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const getMonthNames = () => {
    if (!statistics || !statistics.monthlyTotals) return [];
    return Object.keys(statistics.monthlyTotals).sort();
  };
  
  const prepareChartData = () => {
    if (!statistics || !statistics.monthlyTotals) return [];
    
    const months = getMonthNames();
    
    return months.map(month => {
      const monthName = new Date(month + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      
      let data = {
        name: monthName,
        month: month,
        total: statistics.monthlyTotals[month] || 0
      };
      
      // Добавляем данные по категориям
      statistics.categoryStats.forEach(cat => {
        data[cat.name] = cat.monthlyStats?.[month] || 0;
      });
      
      return data;
    });
  };
  
  const chartData = prepareChartData();
  
  const getColorForIndex = (index) => {
    const colors = ['#FFFFFF', '#A3D9D4', '#84CAC3', '#65BCB3', '#46AEA2', '#379F94', '#288F86', '#198077', '#0A7069'];
    return colors[index % colors.length];
  };
  
  const formatCurrency = (value) => {
    return `${value.toFixed(2)} ₽`;
  };
  
  const categoryColors = {};
  categories.forEach((cat, index) => {
    categoryColors[cat.name] = getColorForIndex(index);
  });

  return (
    <Box className="glass-card" p={6}>
      <Heading size="lg" mb={6} color="white" textShadow="0 2px 4px rgba(0,0,0,0.1)">
        Статистика расходов
      </Heading>
      
      <Flex mb={4}>
        <Select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          width="auto"
          mr={4}
          bg="whiteAlpha.200"
          color="white"
          borderColor="whiteAlpha.400"
          _hover={{ borderColor: 'whiteAlpha.600' }}
          _focus={{ borderColor: 'white', boxShadow: '0 0 0 1px white' }}
        >
          <option value="all" style={{color: 'black'}}>Все категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id.toString()} style={{color: 'black'}}>
              {cat.name}
            </option>
          ))}
        </Select>
      </Flex>
      
      <Tabs isFitted variant="enclosed" mb={6}>
        <TabList borderColor="whiteAlpha.300">
          <Tab 
            color="white" 
            _selected={{ color: 'white', borderColor: 'whiteAlpha.300', borderBottomColor: 'transparent', bg: 'whiteAlpha.200' }}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Линейный график
          </Tab>
          <Tab 
            color="white" 
            _selected={{ color: 'white', borderColor: 'whiteAlpha.300', borderBottomColor: 'transparent', bg: 'whiteAlpha.200' }}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Столбчатая диаграмма
          </Tab>
          <Tab 
            color="white" 
            _selected={{ color: 'white', borderColor: 'whiteAlpha.300', borderBottomColor: 'transparent', bg: 'whiteAlpha.200' }}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Таблица
          </Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box height="400px" mb={6} p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="lg">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="name" stroke="white" />
                  <YAxis tickFormatter={formatCurrency} stroke="white" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none' }}
                    formatter={(value) => [`${value.toFixed(2)} ₽`, '']}
                  />
                  <Legend wrapperStyle={{ color: 'white' }} />
                  {selectedCategory === 'all' ? (
                    <>
                      <Line type="monotone" dataKey="total" stroke="#FFFFFF" name="Всего" strokeWidth={2} />
                      {categories.map((cat, index) => (
                        <Line 
                          key={cat.id}
                          type="monotone" 
                          dataKey={cat.name} 
                          stroke={getColorForIndex(index + 1)} 
                          name={cat.name}
                          strokeWidth={1.5}
                        />
                      ))}
                    </>
                  ) : (
                    categories
                      .filter(cat => cat.id.toString() === selectedCategory)
                      .map((cat, index) => (
                        <Line 
                          key={cat.id}
                          type="monotone" 
                          dataKey={cat.name} 
                          stroke={getColorForIndex(index + 1)} 
                          name={cat.name}
                          strokeWidth={2}
                        />
                      ))
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box height="400px" mb={6} p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="name" stroke="white" />
                  <YAxis tickFormatter={formatCurrency} stroke="white" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none' }}
                    formatter={(value) => [`${value.toFixed(2)} ₽`, '']}
                  />
                  <Legend wrapperStyle={{ color: 'white' }} />
                  {selectedCategory === 'all' ? (
                    <>
                      {categories.map((cat, index) => (
                        <Bar 
                          key={cat.id}
                          dataKey={cat.name} 
                          fill={getColorForIndex(index + 1)} 
                          name={cat.name}
                        />
                      ))}
                    </>
                  ) : (
                    categories
                      .filter(cat => cat.id.toString() === selectedCategory)
                      .map((cat, index) => (
                        <Bar 
                          key={cat.id}
                          dataKey={cat.name} 
                          fill={getColorForIndex(index + 1)} 
                          name={cat.name}
                        />
                      ))
                  )}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box overflowX="auto" bg="rgba(255, 255, 255, 0.1)" borderRadius="lg">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="white" borderColor="whiteAlpha.300">Месяц</Th>
                    {selectedCategory === 'all' ? (
                      <>
                        {categories.map(cat => (
                          <Th key={cat.id} color="white" borderColor="whiteAlpha.300">{cat.name}</Th>
                        ))}
                        <Th color="white" borderColor="whiteAlpha.300">Всего</Th>
                      </>
                    ) : (
                      categories
                        .filter(cat => cat.id.toString() === selectedCategory)
                        .map(cat => (
                          <Th key={cat.id} color="white" borderColor="whiteAlpha.300">{cat.name}</Th>
                        ))
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {chartData.map(data => (
                    <Tr key={data.month}>
                      <Td color="white" borderColor="whiteAlpha.200">{data.name}</Td>
                      {selectedCategory === 'all' ? (
                        <>
                          {categories.map(cat => (
                            <Td key={cat.id} borderColor="whiteAlpha.200">
                              <Badge bg="whiteAlpha.300" color="white">
                                {formatCurrency(data[cat.name] || 0)}
                              </Badge>
                            </Td>
                          ))}
                          <Td fontWeight="bold" color="white" borderColor="whiteAlpha.200">{formatCurrency(data.total)}</Td>
                        </>
                      ) : (
                        categories
                          .filter(cat => cat.id.toString() === selectedCategory)
                          .map(cat => (
                            <Td key={cat.id} borderColor="whiteAlpha.200">
                              <Badge bg="whiteAlpha.300" color="white">
                                {formatCurrency(data[cat.name] || 0)}
                              </Badge>
                            </Td>
                          ))
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mt={8}>
        {statistics?.categoryStats.map((cat, index) => (
          <Box 
            key={cat.id} 
            p={4} 
            bg="rgba(255, 255, 255, 0.1)"
            borderRadius="lg"
            borderLeft="4px solid"
            borderLeftColor={getColorForIndex(index + 1)}
          >
            <Heading size="md" mb={2} color="white">{cat.name}</Heading>
            <Text fontSize="lg" fontWeight="bold" mb={3} color="white">
              {formatCurrency(cat.totalAmount)}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.800">
              Последний месяц: {formatCurrency(Object.entries(cat.monthlyStats || {})
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 1)
                .map(([_, value]) => value)[0] || 0
              )}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Statistics;