import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  InputGroup,
  InputRightElement,
  Box,
} from '@chakra-ui/react';

const ExpenseForm = ({ isOpen, onClose, onSubmit, initialData, categoryName }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        categoryId: initialData.categoryId,
        name: initialData.name,
        amount: initialData.amount,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = () => {
    // Преобразуем дату в ISO формат для отправки на сервер
    const dateObj = new Date(formData.date);
    const submissionData = {
      ...formData,
      date: dateObj.toISOString(),
    };
    
    onSubmit(submissionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent 
        bg="#ffffff" 
        boxShadow="xl"
        borderRadius="xl"
      >
        <Box 
          position="absolute" 
          top="-3px" 
          left="-3px" 
          right="-3px" 
          bottom="-3px" 
          borderRadius="xl" 
        //   bgGradient="linear(to-r, brand.400, brand.200)" 
          opacity="0.6" 
          filter="blur(8px)" 
          zIndex="-1" 
        />
        <ModalHeader>
          {initialData ? 'Редактировать расход' : `Новый расход${categoryName ? ` в категории "${categoryName}"` : ''}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Название</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите название расхода"
              borderColor="brand.200"
              _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #46aea2' }}
            />
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel>Сумма</FormLabel>
            <InputGroup>
              <Input
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                borderColor="brand.200"
                _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #46aea2' }}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" mr={1} bg="brand.100" color="brand.700">
                  ₽
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isRequired mb={4}>
            <FormLabel>Дата</FormLabel>
            <Input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              borderColor="brand.200"
              _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #46aea2' }}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Описание</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Введите описание (необязательно)"
              borderColor="brand.200"
              _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #46aea2' }}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="outline" 
            mr={3} 
            onClick={onClose}
            borderColor="brand.200"
            color="brand.700"
            _hover={{ bg: 'brand.50' }}
          >
            Отмена
          </Button>
          <Button 
            bg="brand.500" 
            color="white" 
            onClick={handleSubmit}
            _hover={{ bg: 'brand.600' }}
          >
            {initialData ? 'Сохранить' : 'Добавить'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExpenseForm;