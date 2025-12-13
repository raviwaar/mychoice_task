import uuid
from django.db import models


class Item(models.Model):
    class GroupChoices(models.TextChoices):
        PRIMARY = 'Primary', 'Primary'
        SECONDARY = 'Secondary', 'Secondary'

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=255)
    group = models.CharField(
        max_length=50,
        choices=GroupChoices.choices,
        default=GroupChoices.PRIMARY
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('name', 'group')

    def __str__(self):
        return f"{self.name} ({self.group})"