import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { 
  ChakraProvider, 
  Box, 
  Container, 
  Heading, 
  Flex, 
  Text, 
  Badge, 
  Button, 
  useToast,
  useDisclosure,
  IconButton,
  SimpleGrid,
  Image,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, StarIcon, ViewIcon } from '@chakra-ui/icons';
import axios from 'axios';

import Dashboard from './components/Dashboard';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Statistics from './components/Statistics';
import theme from './theme';

const API_URL = 'http://localhost:8080/api';

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    currentMonthAmount: 0,
    categoryStats: [],
    monthlyTotals: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  
  // Состояния для редактирования
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const toast = useToast();
  
  const {
    isOpen: isCategoryFormOpen,
    onOpen: onCategoryFormOpen,
    onClose: onCategoryFormClose
  } = useDisclosure();
  
  const {
    isOpen: isExpenseFormOpen,
    onOpen: onExpenseFormOpen,
    onClose: onExpenseFormClose
  } = useDisclosure();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Загружаем категории
      const categoriesRes = await axios.get(`${API_URL}/categories`);
      if (categoriesRes.data.status === 'success') {
        setCategories(categoriesRes.data.data || []);
      }
      
      // Пытаемся загрузить статистику, но обрабатываем возможные ошибки
      try {
        const statisticsRes = await axios.get(`${API_URL}/statistics`);
        if (statisticsRes.data.status === 'success') {
          setStatistics(statisticsRes.data.data);
        }
      } catch (statisticsError) {
        console.error('Error fetching statistics:', statisticsError);
        // В случае ошибки используем значения по умолчанию для статистики
        setStatistics({
          totalAmount: 0,
          currentMonthAmount: 0,
          categoryStats: [],
          monthlyTotals: {}
        });
        // Показываем предупреждение, но не критическую ошибку
        toast({
          title: 'Предупреждение',
          description: 'Не удалось загрузить статистику, но вы можете продолжить пользоваться приложением',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Если есть выбранная категория, загружаем ее расходы
      if (selectedCategory) {
        try {
          const expensesRes = await axios.get(`${API_URL}/expenses?categoryId=${selectedCategory.id}`);
          if (expensesRes.data.status === 'success') {
            setExpenses(expensesRes.data.data || []);
          }
        } catch (expensesError) {
          console.error('Error fetching expenses:', expensesError);
          setExpenses([]);
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить расходы',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    try {
      const response = await axios.get(`${API_URL}/expenses?categoryId=${category.id}`);
      if (response.data.status === 'success') {
        setExpenses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить расходы',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Функции редактирования и создания категорий
  const handleCategoryEdit = (category) => {
    setEditingCategory(category);
    onCategoryFormOpen();
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      if (categoryData.id) {
        // Редактирование существующей категории
        const response = await axios.put(`${API_URL}/categories/${categoryData.id}`, categoryData);
        if (response.data.status === 'success') {
          toast({
            title: 'Категория обновлена',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchData();
          handleCategoryFormClose();
        }
      } else {
        // Создание новой категории
        const response = await axios.post(`${API_URL}/categories`, categoryData);
        if (response.data.status === 'success') {
          toast({
            title: 'Категория создана',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchData();
          handleCategoryFormClose();
        }
      }
    } catch (error) {
      console.error('Error submitting category:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить категорию',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCategoryFormClose = () => {
    setEditingCategory(null);
    onCategoryFormClose();
  };

  const handleCategoryDelete = async (categoryId) => {
    try {
      const response = await axios.delete(`${API_URL}/categories/${categoryId}`);
      if (response.data.status === 'success') {
        toast({
          title: 'Категория удалена',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setSelectedCategory(null);
        setExpenses([]);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить категорию',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Функции редактирования и создания расходов
  const handleExpenseEdit = (expense) => {
    setEditingExpense(expense);
    onExpenseFormOpen();
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      if (expenseData.id) {
        // Редактирование существующего расхода
        const response = await axios.put(`${API_URL}/expenses/${expenseData.id}`, expenseData);
        if (response.data.status === 'success') {
          toast({
            title: 'Расход обновлен',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchData();
          handleExpenseFormClose();
        }
      } else {
        // Создание нового расхода
        if (!selectedCategory) {
          toast({
            title: 'Ошибка',
            description: 'Сначала выберите категорию',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        
        const response = await axios.post(`${API_URL}/expenses`, {
          ...expenseData,
          categoryId: selectedCategory.id
        });
        if (response.data.status === 'success') {
          toast({
            title: 'Расход добавлен',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchData();
          handleExpenseFormClose();
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить расход',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExpenseFormClose = () => {
    setEditingExpense(null);
    onExpenseFormClose();
  };

  const handleExpenseDelete = async (expenseId) => {
    try {
      const response = await axios.delete(`${API_URL}/expenses/${expenseId}`);
      if (response.data.status === 'success') {
        toast({
          title: 'Расход удален',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить расход',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShowAllCategories = () => {
    setSelectedCategory(null);
    setExpenses([]);
  };

  const handleToggleStatistics = () => {
    setShowStatistics(!showStatistics);
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box className="app-gradient-bg">
          <Box as="header" py={4} backdropFilter="blur(10px)" bg="rgba(255, 255, 255, 0)" shadow="md">
            <Container maxW="container.xl">
              <Flex justifyContent="space-between" alignItems="center">
                <Link to="/">
                  <Heading size="lg" color="white" textShadow="0 2px 4px rgba(0,0,0,0.1)">
                    Учет расходов
                  </Heading>
                </Link>
                <Flex>
                  <Button 
                    colorScheme="whiteAlpha" 
                    variant="outline" 
                    mr={3} 
                    onClick={handleToggleStatistics}
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    {showStatistics ? 'Показать расходы' : 'Показать статистику'}
                  </Button>
                  <Button 
                    leftIcon={<AddIcon />} 
                    variant="outline" 
                    colorScheme="whiteAlpha" 
                    onClick={() => {
                      setEditingCategory(null); // Сбрасываем состояние редактирования
                      onCategoryFormOpen();
                    }}
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    Новая категория
                  </Button>
                </Flex>
              </Flex>
            </Container>
          </Box>

          <Box py={6}>
            <Container maxW="container.xl">
              {!isLoading && (
                <Box mb={6} p={4} className="glass-card">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Flex direction="column" justifyContent="center">
                      <Heading size="md" color="white" mb={4}>Финансовая статистика</Heading>
                      <Stack spacing={4}>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text color="white" fontWeight="medium">Общая сумма расходов:</Text>
                          <Text fontSize="xl" fontWeight="bold" color="white">
                            {statistics?.totalAmount.toFixed(2)} ₽
                          </Text>
                        </Flex>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text color="white" fontWeight="medium">Расходы за текущий месяц:</Text>
                          <Text fontSize="xl" fontWeight="bold" color="white">
                            {statistics?.currentMonthAmount.toFixed(2)} ₽
                          </Text>
                        </Flex>
                      </Stack>
                    </Flex>
                    <Flex justifyContent="center" alignItems="center">
                      <Box
                        w={{ base: "100%", md: "60%" }}
                        h="140px"
                        bg="#0D1421"
                        borderRadius="lg"
                        boxShadow="lg"
                        p={4}
                        position="relative"
                        overflow="hidden"
                      >
                        <Flex justify="space-between" align="center" mb={4}>
                          <Box>
                            <Text fontSize="xs" color="#FFFFFF">Финансовый помощник</Text>
                            <Text fontWeight="bold" color="#FFFFFF">Ваш бюджет</Text>
                          </Box>
                          <StarIcon color="brand.500" />
                        </Flex>
                        <Text fontSize="xl" fontWeight="bold" color="brand.600">
                          {statistics?.totalAmount.toFixed(2)} ₽
                        </Text>
                        <Box
                          position="absolute"
                          bottom="-10px"
                          right="-10px"
                          borderRadius="full"
                          w="80px"
                          h="80px"
                          bg="brand.100"
                          opacity="0.5"
                        />
                      </Box>
                    </Flex>
                  </SimpleGrid>
                </Box>
              )}

              <Flex mb={6} overflowX="auto" pb={2}>
                <Button 
                  className={selectedCategory === null ? "category-pill active" : "category-pill"}
                  color="white"
                  mr={2} 
                  onClick={handleShowAllCategories}
                  bg="transparent"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Все категории
                </Button>
                {categories.map(category => (
                  <Box key={category.id} mr={2}>
                    <Button
                      className={selectedCategory?.id === category.id ? "category-pill active" : "category-pill"}
                      color="white"
                      onClick={() => handleCategorySelect(category)}
                      bg="transparent"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      {category.name}
                      <Badge ml={2} bg="whiteAlpha.300" color="white">
                        {category.totalAmount.toFixed(2)} ₽
                      </Badge>
                    </Button>
                  </Box>
                ))}
              </Flex>

              {showStatistics ? (
                <Statistics statistics={statistics} categories={categories} />
              ) : (
                <>
                  {selectedCategory ? (
                    <Box className="glass-card" overflow="hidden">
                      <Flex justifyContent="space-between" alignItems="center" p={4} bg="rgba(255, 255, 255, 0.1)">
                        <Heading size="md" color="white">{selectedCategory.name}</Heading>
                        <Flex>
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit category"
                            size="sm"
                            mr={2}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            onClick={() => handleCategoryEdit(selectedCategory)}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete category"
                            size="sm"
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            mr={2}
                            onClick={() => {
                              if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
                                handleCategoryDelete(selectedCategory.id);
                            }
                        }}
                      />
                      <Button
                        leftIcon={<AddIcon />}
                        variant="outline"
                        colorScheme="whiteAlpha"
                        size="sm"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={() => {
                          setEditingExpense(null); // Сбрасываем состояние редактирования
                          onExpenseFormOpen();
                        }}
                      >
                        Добавить расход
                      </Button>
                    </Flex>
                  </Flex>
                  <ExpenseList
                    expenses={expenses}
                    onDelete={handleExpenseDelete}
                    onEdit={handleExpenseEdit}
                  />
                </Box>
              ) : (
                <CategoryList
                  categories={categories}
                  onSelect={handleCategorySelect}
                  onDelete={handleCategoryDelete}
                  onEdit={handleCategoryEdit}
                />
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Форма категории */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleCategoryFormClose}
        onSubmit={handleCategorySubmit}
        initialData={editingCategory}
      />

      {/* Форма расхода */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={handleExpenseFormClose}
        onSubmit={handleExpenseSubmit}
        initialData={editingExpense}
        categoryName={selectedCategory?.name}
      />
    </Box>
  </Router>
</ChakraProvider>
);
}

export default App;