from django.db import models

# Create your models here.


class QuestionSet(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Question(models.Model):
    text = models.TextField()
    set = models.ForeignKey(
        QuestionSet,
        on_delete=models.CASCADE,
        related_name='questions'
    )

    def __str__(self):
        return self.text


class Answer(models.Model):
    question = models.ForeignKey(
        Question,
        related_name='answers',
        on_delete=models.CASCADE
    )
    rating = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to '{self.question.text}' - {self.rating}"
