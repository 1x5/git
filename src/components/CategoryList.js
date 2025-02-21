import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  IconButton,
  Flex,
  SimpleGrid,
  HStack,
  Stack,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';

const CategoryList = ({ categories, onSelect, onDelete, onEdit }) => {
  return (
    <Box>
      <Heading size="md" mb={6} color="white" textShadow="0 2px 4px rgba(0,0,0,0.1)">
        Категории расходов
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {categories.map(category => (
          <Box 
            key={category.id} 
            p={5} 
            className="glass-card"
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md" isTruncated color="white">
                {category.name}
              </Heading>
              <HStack spacing={1}>
                <IconButton
                  icon={<ViewIcon />}
                  aria-label="View category"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => onSelect(category)}
                />
                <IconButton
                  icon={<EditIcon />}
                  aria-label="Edit category"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => onEdit(category)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete category"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
                      onDelete(category.id);
                    }
                  }}
                />
              </HStack>
            </Flex>
            
            {category.description && (
              <Text fontSize="sm" color="whiteAlpha.800" mb={4} noOfLines={2}>
                {category.description}
              </Text>
            )}
            
            <Stack spacing={3}>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="whiteAlpha.800">Всего расходов:</Text>
                <Badge bg="whiteAlpha.400" color="white" fontSize="md" p={1} borderRadius="md">
                  {category.totalAmount.toFixed(2)} ₽
                </Badge>
              </Flex>
              
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="whiteAlpha.800">Записей:</Text>
                <Badge bg="whiteAlpha.200" color="white" borderRadius="full" px={2}>
                  {category.expenses?.length || 0}
                </Badge>
              </Flex>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default CategoryList;