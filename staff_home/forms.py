from django import forms
from django.forms import DateTimeInput
import datetime
from .models import Track, ProblemStatementConfig, ProblemStatementSection, Brochure, Submission, SubmissionWindow, Announcments, Resource, Question, Test

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
            'schedule_for_later': forms.DateInput(attrs={'type': 'date'}),
            'valid_till': forms.DateInput(attrs={'type': 'date'}),
        }

        def clean(self):
            cleaned_data = super().clean()
            schedule_date = cleaned_data.get('schedule_for_later')
            valid_till = cleaned_data.get('valid_till')
            today = datetime.date.today()

            if schedule_date and schedule_date < today:
                self.add_error('schedule_for_later', 'Scheduled date cannot be in the past.')

            if valid_till and schedule_date and valid_till < schedule_date:
                self.add_error('valid_till', 'Valid till date must be after the scheduled date.')

            return cleaned_data

class TrackForm(forms.ModelForm):
    class Meta:
        model = Track
        fields = ["name", "description", "enabled", "file", "qualifying_status", "order"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "enabled": forms.CheckboxInput(attrs={"class": "form-check-input"}),
            "file": forms.FileInput(attrs={"class": "form-control", "accept": ".pdf,.doc,.docx"}),
            "qualifying_status": forms.Select(attrs={"class": "form-select"}),
            "order": forms.NumberInput(attrs={"class": "form-control", "min": 0}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk and not self.initial.get("qualifying_status"):
            self.initial["qualifying_status"] = "pending"

    def clean_file(self):
        file = self.cleaned_data.get("file")
        if file and hasattr(file, "name"):
            ext = file.name.split(".")[-1].lower()
            if ext not in ["pdf", "doc", "docx"]:
                raise forms.ValidationError("Only PDF and Word documents (.pdf, .doc, .docx) are allowed.")
        return file

class ProblemStatementConfigForm(forms.ModelForm):
    class Meta:
        model = ProblemStatementConfig
        fields = ["enabled", "file"]

class ProblemStatementSectionForm(forms.ModelForm):
    class Meta:
        model = ProblemStatementSection
        fields = ["track", "title", "content", "order"]
        widgets = {
            "track": forms.Select(attrs={"class": "form-select"}),
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 5}),
            "order": forms.NumberInput(attrs={"class": "form-control", "min": 0}),
        }

class ResourceForm(forms.ModelForm):
    class Meta:
        model = Resource
        fields = ["track", "title", "description", "file", "link"]
        widgets = {
            "track": forms.Select(attrs={"class": "form-select"}),
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 2}),
            "file": forms.FileInput(attrs={"class": "form-control"}),
            "link": forms.URLInput(attrs={"class": "form-control"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if "track" in self.fields:
            self.fields["track"].empty_label = None
            if not self.instance.pk and not self.initial.get("track"):
                first_track = Track.objects.first()
                if first_track:
                    self.initial["track"] = first_track.id

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