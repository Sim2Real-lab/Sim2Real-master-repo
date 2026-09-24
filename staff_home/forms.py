from django import forms
from .models import Announcments,Resource,Question,Test
from django.forms import DateTimeInput
import datetime
from .models import ProblemStatementConfig, ProblemStatementSection,Brochure, Submission, SubmissionWindow
class AnnouncmentForm(forms.ModelForm):
    class Meta:
        model = Announcments
        fields = [
            'message',
            'schedule_for_later',
            'valid_till',
            'manual_visibility',
            'manual_validity',
            'category',
        ]

        widgets = {
            'schedule_for_later': forms.DateInput(
                attrs={'type': 'date'}
            ),
            'valid_till': forms.DateInput(
                attrs={'type': 'date'}
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        today = datetime.date.today()

        # Maximum date = exactly 10 years from today
        from dateutil.relativedelta import relativedelta
        max_date = today + relativedelta(years=10)

        # Schedule date: today → 10 years from today
        self.fields['schedule_for_later'].widget.attrs.update({
            'min': today.isoformat(),
            'max': max_date.isoformat(),
        })

        # Valid till: today → 10 years from today
        self.fields['valid_till'].widget.attrs.update({
            'min': today.isoformat(),
            'max': max_date.isoformat(),
        })

    def clean(self):
        cleaned_data = super().clean()

        schedule_date = cleaned_data.get('schedule_for_later')
        valid_till = cleaned_data.get('valid_till')
        today = datetime.date.today()

        # Schedule date cannot be in the past
        if schedule_date and schedule_date < today:
            self.add_error(
                'schedule_for_later',
                'Scheduled date cannot be in the past.'
            )

        # Valid till cannot be before schedule date
        if valid_till and schedule_date and valid_till < schedule_date:
            self.add_error(
                'valid_till',
                'Valid till date must be after the scheduled date.'
            )

        return cleaned_data
        

class ProblemStatementConfigForm(forms.ModelForm):
    class Meta:
        model = ProblemStatementConfig
        fields = ["enabled", "file"]

class ProblemStatementSectionForm(forms.ModelForm):
    class Meta:
        model = ProblemStatementSection
        fields = ["title", "content", "order"]

class ResourceForm(forms.ModelForm):
    class Meta:
        model = Resource
        fields = ["title", "file", "link"]

class BrochureForm(forms.ModelForm):
    class Meta:
        model = Brochure
        fields = ["file"]

    def clean_file(self):
        file = self.cleaned_data.get('file')
        max_size = 50 * 1024 * 1024  # 50 MB
        if file.size > max_size:
            raise forms.ValidationError("File too large (max 50 MB).")
        return file

class SubmissionWindowForm(forms.ModelForm):
    class Meta:
        model = SubmissionWindow
        fields = ["title", "description", "start_date", "end_date", "is_visible"]

class SubmissionForm(forms.ModelForm):
    class Meta:
        model = Submission
        fields = ["link"]

class TestForm(forms.ModelForm):
    class Meta:
        model=Test
        fields= [
             "title",
            "description",
            "code",
            "start_datetime",
            "end_datetime",
            "duration",
            "is_visible",
        ]
        widgets = {
            "start_datetime": DateTimeInput(attrs={"type": "datetime-local", "class": "form-control"}),
            "end_datetime": DateTimeInput(attrs={"type": "datetime-local", "class": "form-control"}),
            "duration": forms.NumberInput(attrs={"class": "form-control", "min": 1}),
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "code": forms.TextInput(attrs={"class": "form-control"}),
            "is_visible": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = [
            "text",
            "question_type",      # e.g., MCQ, Descriptive, Coding
            "options",            # JSON/TextField for MCQs
            "correct_answer",     # For MCQ or coding expected output
            "marks",
            "negative_marks",
            "compiler_enabled",    # Boolean for coding questions
        ]
        widgets = {
            "text": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "question_type": forms.Select(attrs={"class": "form-select"}),
            "options": forms.Textarea(attrs={"class": "form-control", "rows": 3, "placeholder": "For MCQs: comma separated options"}),
            "correct_answer": forms.TextInput(attrs={"class": "form-control"}),
            "marks": forms.NumberInput(attrs={"class": "form-control", "min": 0}),
            "negative_marks": forms.NumberInput(attrs={"class": "form-control", "min": 0}),
            "compiler_enabled": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }