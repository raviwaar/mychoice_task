import React, { useEffect, useState } from 'react';
import {
    Box, Button, Container, Heading, Table, Thead, Tbody, Tr, Th, Td,
    Tag, IconButton, useDisclosure, useToast, Flex, Input, Select, HStack, Text
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { getItems, deleteItem } from './api';
import ItemModal from './ItemModal';

function App() {

    const getInitialParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            cursor: params.get('cursor') || null,
            search: params.get('search') || '',
            group: params.get('group') || ''
        };
    };

    const initialParams = getInitialParams();

    const [items, setItems] = useState([]);

    const [cursor, setCursor] = useState(initialParams.cursor);

    const [nextCursor, setNextCursor] = useState(null);
    const [prevCursor, setPrevCursor] = useState(null);

    const [search, setSearch] = useState(initialParams.search);
    const [groupFilter, setGroupFilter] = useState(initialParams.group);

    const [selectedItem, setSelectedItem] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        const params = new URLSearchParams();
        if (cursor) params.set('cursor', cursor);
        if (search) params.set('search', search);
        if (groupFilter) params.set('group', groupFilter);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
    }, [cursor, search, groupFilter]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const params = {};
                if (cursor) params.cursor = cursor;
                if (search) params.search = search;
                if (groupFilter) params.group = groupFilter;

                const response = await getItems(params, { signal: controller.signal });

                setItems(response.data.results);

                const extractCursor = (fullUrl) => {
                    if (!fullUrl) return null;
                    const urlObj = new URL(fullUrl);
                    return urlObj.searchParams.get('cursor');
                };

                setNextCursor(extractCursor(response.data.next));
                setPrevCursor(extractCursor(response.data.previous));

            } catch (error) {
                if (error.name !== 'CanceledError') {
                    console.error("Fetch failed", error);
                    toast({ title: 'Error fetching items', status: 'error' });
                }
            }
        };

        fetchData();

        return () => controller.abort();
    }, [cursor, search, groupFilter, refreshTrigger, toast]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCursor(null);
    };

    const handleGroupFilterChange = (e) => {
        setGroupFilter(e.target.value);
        setCursor(null);
    };

    const handleNext = () => { if (nextCursor) setCursor(nextCursor); };
    const handlePrev = () => { if (prevCursor) setCursor(prevCursor); };

    const handleGoHome = () => {
        setCursor(null);
        setSearch('');
        setGroupFilter('');
    };

    const handleOpenModal = (item = null, mode = 'create') => {
        setSelectedItem(item);
        setModalMode(mode);
        onOpen();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteItem(id);
                if (items.length === 1 && prevCursor) {
                    setCursor(prevCursor);
                    toast({ title: 'Page empty, moved to previous page', status: 'info', duration: 3000 });
                }

                else {
                    setRefreshTrigger((prev) => prev + 1);
                    toast({ title: 'Item deleted', status: 'success', duration: 2000 });
                }

            } catch (error) {
                console.error("Delete failed", error);
                toast({ title: 'Error deleting item', status: 'error' });
            }
        }
    };

    const handleSuccess = () => {
        if (modalMode === 'create') {
            setCursor(null);

            setSearch('');
            setGroupFilter('');

            toast({
                title: 'Item Created',
                description: 'Jumping to start of list to show your new item.',
                status: 'success',
                duration: 3000
            });
        } else {
            toast({ title: 'Item Updated', status: 'success', duration: 2000 });
        }

        setRefreshTrigger((prev) => prev + 1);
        onClose();
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Flex justifyContent="space-between" alignItems="center" mb={6}>
                {/* Clickable Heading acts as a "Home" link */}
                <Heading
                    cursor="pointer"
                    onClick={handleGoHome}
                    _hover={{ color: 'blue.500', textDecoration: 'underline' }}
                    title="Go to First Page"
                >
                    Inventory Dashboard
                </Heading>

                <Button colorScheme="blue" onClick={() => handleOpenModal(null, 'create')}>
                    + Add Item
                </Button>
            </Flex>

            <HStack mb={4} spacing={4}>
                <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearchChange}
                    bg="white"
                />
                <Select
                    placeholder="All Groups"
                    value={groupFilter}
                    onChange={handleGroupFilterChange}
                    width="200px"
                    bg="white"
                >
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                </Select>
            </HStack>

            <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Name</Th>
                            <Th>Group</Th>
                            <Th width="120px">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {items.length > 0 ? items.map((item) => (
                            <Tr key={item.id}>
                                <Td fontWeight="bold">{item.name}</Td>
                                <Td>
                                    <Tag colorScheme={item.group === 'Primary' ? 'green' : 'purple'}>
                                        {item.group}
                                    </Tag>
                                </Td>
                                <Td>
                                    <IconButton
                                        icon={<EditIcon />}
                                        size="sm"
                                        mr={2}
                                        aria-label="View and Edit"
                                        onClick={() => handleOpenModal(item, 'edit')}
                                    />
                                    <IconButton
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        aria-label="Delete"
                                        onClick={() => handleDelete(item.id)}
                                    />
                                </Td>
                            </Tr>
                        )) : (
                            <Tr><Td colSpan={3} textAlign="center" py={4}>No items found.</Td></Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* CONTROLS */}
            <Flex mt={4} alignItems="center" justifyContent="center">
                <Button
                    onClick={handlePrev}
                    isDisabled={!prevCursor}
                    leftIcon={<ArrowBackIcon />}
                    mr={4}
                >
                    Previous
                </Button>

                <Text color="gray.500" fontSize="sm">
                    {prevCursor ? "Browsing history..." : "First Page"}
                </Text>

                <Button
                    onClick={handleNext}
                    isDisabled={!nextCursor}
                    rightIcon={<ArrowForwardIcon />}
                    ml={4}
                >
                    Next
                </Button>
            </Flex>

            {isOpen && (
                <ItemModal
                    isOpen={isOpen}
                    onClose={onClose}
                    item={selectedItem}
                    mode={modalMode}
                    onSuccess={handleSuccess}
                />
            )}
        </Container>
    );
}

export default App;