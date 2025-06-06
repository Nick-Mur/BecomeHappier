from django.db import models

# Create your models here.

class QuestionSet(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, db_index=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    text = models.CharField(max_length=255)
    set = models.ForeignKey(QuestionSet, related_name='questions', on_delete=models.CASCADE)

    def __str__(self):
        return self.text

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    rating = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to '{self.question.text}' - {self.rating}"
