from django.core.management.base import BaseCommand
from django.db import transaction
from items.models import Item
from faker import Faker
import random

fake = Faker()


class Command(BaseCommand):
    help = "Seed the database with unique items"

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=100)
        parser.add_argument("--flush", action="store_true")

    def handle(self, *args, **options):
        count = options["count"]

        if options["flush"]:
            self.stdout.write("Deleting existing items...")
            Item.objects.all().delete()

        self.stdout.write(f"Creating {count} items...")

        groups = [Item.GroupChoices.PRIMARY, Item.GroupChoices.SECONDARY]
        items = []

        for i in range(1, count + 1):
            word = fake.word().title()
            number = fake.unique.random_int(min=1, max=10_000_000)

            items.append(
                Item(
                    name=f"{word}-{number}",
                    group=random.choice(groups),
                )
            )

        with transaction.atomic():
            Item.objects.bulk_create(items, batch_size=1000)

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {count} unique items")
        )
