from rest_framework import serializers
from .models import QuestionSet, Question, Answer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text']

class QuestionSetSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = QuestionSet
        fields = ['id', 'name', 'is_active', 'order', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        question_set = QuestionSet.objects.create(**validated_data)
        for question_data in questions_data:
            Question.objects.create(set=question_set, **question_data)
        return question_set

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions')

        instance.name = validated_data.get('name', instance.name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.order = validated_data.get('order', instance.order)
        instance.save()

        # Обновление и создание вопросов
        existing_questions = instance.questions.all()
        existing_questions_map = {q.id: q for q in existing_questions}

        for question_data in questions_data:
            question_id = question_data.get('id')
            if question_id and question_id in existing_questions_map:
                # Обновляем существующий вопрос
                question = existing_questions_map.pop(question_id)
                question.text = question_data.get('text', question.text)
                question.save()
            else:
                # Создаем новый вопрос
                Question.objects.create(set=instance, **question_data)

        # Удаляем вопросы, которых нет в новом списке
        for question_id, question in existing_questions_map.items():
            question.delete()

        return instance

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'rating', 'date'] 