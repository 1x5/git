import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Box,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box overflow="auto" bg="rgba(255, 0, 0, 0)" backdropFilter="blur(5px)">
      {expenses.length === 0 ? (
        <Box p={6} textAlign="center">
          <Text color="white">В этой категории пока нет расходов</Text>
        </Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="white" borderColor="whiteAlpha.300">Название</Th>
              <Th color="white" borderColor="whiteAlpha.300">Сумма</Th>
              <Th color="white" borderColor="whiteAlpha.300">Дата</Th>
              <Th color="white" borderColor="whiteAlpha.300">Описание</Th>
              <Th width="100px" color="white" borderColor="whiteAlpha.300">Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {expenses.map(expense => (
              <Tr key={expense.id} _hover={{ bg: 'whiteAlpha.100' }}>
                <Td color="white" borderColor="whiteAlpha.200">{expense.name}</Td>
                <Td borderColor="whiteAlpha.200">
                  <Badge bg="whiteAlpha.300" color="white" p={1} borderRadius="md">
                    {expense.amount.toFixed(2)} ₽
                  </Badge>
                </Td>
                <Td color="white" borderColor="whiteAlpha.200">{formatDate(expense.date)}</Td>
                <Td color="white" borderColor="whiteAlpha.200">{expense.description}</Td>
                <Td borderColor="whiteAlpha.200">
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit expense"
                    size="sm"
                    mr={2}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => onEdit(expense)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete expense"
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => {
                      if (window.confirm('Вы уверены, что хотите удалить этот расход?')) {
                        onDelete(expense.id);
                      }
                    }}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ExpenseList;