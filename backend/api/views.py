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

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        order = request.data.get('order', [])
        if not order:
            return Response({'error': 'Order list is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Получаем все наборы по имени для быстрого доступа
        sets_by_name = {s.name: s for s in QuestionSet.objects.all()}

        # Обновляем порядок наборов
        for index, set_name in enumerate(order):
            set_obj = sets_by_name.get(set_name)
            if set_obj:
                set_obj.order = index
                set_obj.save()
            else:
                # Если набор с таким именем не найден, возвращаем ошибку
                return Response({'error': f'Set with name "{set_name}" not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Возвращаем обновленный список наборов, отсортированный по новому порядку
        updated_sets = QuestionSet.objects.all().order_by('order', 'id')
        serializer = self.get_serializer(updated_sets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

@api_view(['POST'])
def reorder_sets(request):
    try:
        order = request.data.get('order', [])
        if not order:
            return Response({'error': 'Order list is required'}, status=400)
            
        # Получаем все наборы
        sets = QuestionSet.objects.all()
        
        # Создаем словарь для быстрого доступа к наборам по имени
        sets_dict = {set.name: set for set in sets}
        
        # Проверяем, что все наборы из order существуют
        for set_name in order:
            if set_name not in sets_dict:
                return Response({'error': f'Set {set_name} not found'}, status=404)
        
        # Обновляем порядок наборов
        for index, set_name in enumerate(order):
            set_obj = sets_dict[set_name]
            set_obj.order = index
            set_obj.save()
        
        # Возвращаем обновленный список наборов
        updated_sets = QuestionSet.objects.all().order_by('order')
        serializer = QuestionSetSerializer(updated_sets, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
