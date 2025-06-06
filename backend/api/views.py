from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import QuestionSet, Question, Answer
from .serializers import QuestionSetSerializer, QuestionSerializer, AnswerSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from rest_framework.views import APIView

# Create your views here.

class QuestionSetViewSet(viewsets.ModelViewSet):
    queryset = QuestionSet.objects.all().order_by('order', 'id')
    serializer_class = QuestionSetSerializer

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        set_obj = self.get_object()
        set_obj.is_active = not set_obj.is_active
        set_obj.save()
        return Response(self.get_serializer(set_obj).data)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        order = request.data.get('order', [])
        for idx, set_id in enumerate(order):
            try:
                qs = QuestionSet.objects.get(id=set_id)
                qs.order = idx
                qs.save()
            except QuestionSet.DoesNotExist:
                continue
        return Response({'status': 'ok'})

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all().order_by('-date')
    serializer_class = AnswerSerializer

class StatisticsView(APIView):
    def get(self, request):
        answers = Answer.objects.all()
        average = answers.aggregate(avg=Avg('rating'))['avg'] or 0
        positive = answers.filter(rating__gt=3).count()
        neutral = answers.filter(rating=3).count()
        negative = answers.filter(rating__lt=3).count()
        return Response({
            'average': average,
            'positive': positive,
            'neutral': neutral,
            'negative': negative
        })

class MoodDataView(APIView):
    def get(self, request):
        answers = Answer.objects.all().order_by('date')
        data = [
            {
                'date': answer.date.strftime('%d.%m'),
                'rating': answer.rating
            }
            for answer in answers
        ]
        return Response(data)

class ActiveQuestionsView(APIView):
    def get(self, request):
        active_sets = QuestionSet.objects.filter(is_active=True)
        questions = Question.objects.filter(set__in=active_sets)
        data = [
            {
                'setName': q.set.name,
                'question': q.text
            }
            for q in questions
        ]
        return Response(data)
