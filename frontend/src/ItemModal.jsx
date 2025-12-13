import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, Select, Text, VStack, Spinner, Center, FormHelperText, Divider, Box
} from '@chakra-ui/react';
import { createItem, updateItem, getItem } from './api';

const ItemModal = ({ isOpen, onClose, item, mode, onSuccess }) => {
    const isCreate = mode === 'create';

    const [loading, setLoading] = useState(() => !!(item?.id && !isCreate));

    const [formData, setFormData] = useState({ name: '', group: 'Primary' });
    const [fullItemData, setFullItemData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item?.id && !isCreate) {
            getItem(item.id)
                .then((response) => {
                    setFullItemData(response.data);
                    setFormData({
                        name: response.data.name,
                        group: response.data.group
                    });
                })
                .catch(() => setError('Failed to load item details.'))
                .finally(() => setLoading(false));
        }
    }, [item, isCreate]);

    const handleSubmit = async () => {
        try {
            if (isCreate) {
                await createItem(formData);
            } else {
                await updateItem(item.id, formData);
            }
            onSuccess();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else {
                setError('An error occurred.');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{isCreate ? 'Create New Item' : 'Edit Item Details'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {loading ? (
                        <Center py={10}><Spinner /></Center>
                    ) : (
                        <VStack spacing={4} align="stretch">

                            {/* Editable Fields */}
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Group</FormLabel>
                                <Select
                                    value={formData.group}
                                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                                >
                                    <option value="Primary">Primary</option>
                                    <option value="Secondary">Secondary</option>
                                </Select>
                            </FormControl>

                            {/* Read-Only Metadata (Only shown when Editing/Viewing) */}
                            {!isCreate && fullItemData && (
                                <Box pt={4}>
                                    <Divider mb={4} />
                                    <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>System Details (Read Only)</Text>

                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.500" mb={0}>ID</FormLabel>
                                        <Text fontSize="sm" fontFamily="monospace">{fullItemData.id}</Text>
                                    </FormControl>

                                    <FormControl mt={2}>
                                        <FormLabel fontSize="xs" color="gray.500" mb={0}>Created At</FormLabel>
                                        <Text fontSize="sm">{new Date(fullItemData.created_at).toLocaleString()}</Text>
                                    </FormControl>

                                    <FormControl mt={2}>
                                        <FormLabel fontSize="xs" color="gray.500" mb={0}>Last Updated</FormLabel>
                                        <Text fontSize="sm">{new Date(fullItemData.updated_at).toLocaleString()}</Text>
                                    </FormControl>
                                </Box>
                            )}

                            {error && <Text color="red.500" fontSize="sm">{error}</Text>}
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    {!loading && (
                        <Button colorScheme="blue" onClick={handleSubmit}>
                            {isCreate ? 'Create' : 'Save Changes'}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ItemModal;