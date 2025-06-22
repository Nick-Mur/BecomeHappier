from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionSetViewSet, AnswerViewSet, StatisticsView, MoodDataView, ActiveQuestionsView

router = DefaultRouter()
router.register(r'sets', QuestionSetViewSet, basename='questionset')
router.register(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
    path('mooddata/', MoodDataView.as_view(), name='mooddata'),
    path('questions/active/', ActiveQuestionsView.as_view(), name='active-questions'),
] 