from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Item


class ItemTests(APITestCase):
    def setUp(self):
        self.item1 = Item.objects.create(name="Rock", group="Primary")
        self.item2 = Item.objects.create(name="Paper", group="Secondary")

        self.list_url = reverse('item-list')

    def test_create_item(self):
        """
        Ensure we can create a new item object.
        """
        data = {'name': 'Scissors', 'group': 'Primary'}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 3)
        self.assertEqual(Item.objects.get(name='Scissors').group, 'Primary')

    def test_create_duplicate_item_in_same_group(self):
        """
        Ensure we CANNOT create an item with the same name and group.
        """
        data = {'name': 'Rock', 'group': 'Primary'}  # Already exists from setUp
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_same_name_different_group(self):
        """
        Ensure we CAN create an item with the same name but in a different group.
        """
        data = {'name': 'Rock', 'group': 'Secondary'}  # 'Rock' exists in Primary, not Secondary
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_items_list(self):
        """
        Ensure we can retrieve the list of items.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_items(self):
        """
        Ensure search functionality works.
        """
        response = self.client.get(self.list_url, {'search': 'Rock'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Rock')