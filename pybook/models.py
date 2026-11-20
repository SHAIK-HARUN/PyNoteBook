from django.db import models
from django.contrib.auth.models import User


class Notebook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notebooks')
    title = models.CharField(max_length=200, default='Python Practice Notebook')
    description = models.TextField(blank=True, default='Interactive Python theory and code notebook')
    cover_color = models.CharField(max_length=50, default='navy')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (ID: {self.id})"


class Page(models.Model):
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='pages')
    page_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=200, default='Page 1')
    date_str = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['page_number']

    def __str__(self):
        return f"Page {self.page_number} - {self.title}"


class NotebookBlock(models.Model):
    BLOCK_TYPES = [
        ('headline', 'Headline'),
        ('theory', 'Theory'),
        ('code', 'Code'),
        ('output', 'Output'),
    ]

    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='blocks')
    order = models.PositiveIntegerField(default=0)
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES, default='theory')
    content = models.TextField(blank=True, default='')
    output = models.TextField(blank=True, default='')
    output_image = models.TextField(blank=True, default='')  # Base64 data URL for plots
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"[{self.block_type.upper()}] Page {self.page.page_number} (Order: {self.order})"


class Algorithm(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50, default='Beginner')
    time_complexity = models.CharField(max_length=50, default='O(n)')
    space_complexity = models.CharField(max_length=50, default='O(1)')
    headline = models.CharField(max_length=200)
    theory = models.TextField()
    code = models.TextField()
    sample_output = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.category})"
