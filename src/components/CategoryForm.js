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
  Box,
} from '@chakra-ui/react';

const CategoryForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyStats: {}
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
        monthlyStats: initialData.monthlyStats || {}
      });
    } else {
      setFormData({
        name: '',
        description: '',
        monthlyStats: {}
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent 
        bg="rgba(255, 255, 255, 0.9)" 
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
          bgGradient="linear(to-r, brand.400, brand.200)" 
          opacity="0.6" 
          filter="blur(8px)" 
          zIndex="-1" 
        />
        <ModalHeader>{initialData ? 'Редактировать категорию' : 'Новая категория'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Название</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите название категории"
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
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryForm;