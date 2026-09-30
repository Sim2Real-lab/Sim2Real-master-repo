from django import forms
from datetime import date
import re
from .models import UserProfile

NITK_COLLEGE_NAME = "National Institute of Technology Karnataka"


class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'contact', 'branch', 'college', 'year', 'dob', 'photo']

    def __init__(self, *args, is_nitk=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.is_nitk = is_nitk
        self.fields['photo'].required = False
        if self.is_nitk:
            self.fields['college'].initial = NITK_COLLEGE_NAME
            self.fields['college'].required = False

    def clean_first_name(self):
        first_name = self.cleaned_data.get('first_name', '').strip()
        if not first_name:
            raise forms.ValidationError("First name is required.")
        if len(first_name) > 100:
            raise forms.ValidationError("First name must not exceed 100 characters.")
        return first_name

    def clean_last_name(self):
        last_name = self.cleaned_data.get('last_name', '').strip()
        if not last_name:
            raise forms.ValidationError("Last name is required.")
        if len(last_name) > 100:
            raise forms.ValidationError("Last name must not exceed 100 characters.")
        return last_name

    def clean_contact(self):
        contact = self.cleaned_data.get('contact', '').strip()
        if not contact:
            raise forms.ValidationError("Contact number is required.")
        if not re.fullmatch(r'^\d{10}$', contact):
            raise forms.ValidationError("Please provide a valid 10-digit positive contact number.")
        return contact

    def clean_branch(self):
        branch = self.cleaned_data.get('branch', '').strip()
        if not branch:
            raise forms.ValidationError("Branch is required.")
        if len(branch) > 50:
            raise forms.ValidationError("Branch name must not exceed 50 characters.")
        return branch

    def clean_college(self):
        if self.is_nitk:
            return NITK_COLLEGE_NAME
        college = self.cleaned_data.get('college', '').strip()
        if not college:
            raise forms.ValidationError("College name is required.")
        if len(college) > 100:
            raise forms.ValidationError("College name must not exceed 100 characters.")
        return college

    def clean_year(self):
        year = self.cleaned_data.get('year', '').strip()
        if not year:
            raise forms.ValidationError("Year of study is required.")
        if len(year) > 10:
            raise forms.ValidationError("Year value must not exceed 10 characters.")
        return year

    def clean_dob(self):
        dob = self.cleaned_data.get('dob')
        if not dob:
            raise forms.ValidationError("Date of birth is required.")

        today = date.today()
        try:
            max_dob = today.replace(year=today.year - 18)
        except ValueError:
            max_dob = today.replace(month=2, day=28, year=today.year - 18)

        try:
            min_dob = today.replace(year=today.year - 30)
        except ValueError:
            min_dob = today.replace(month=2, day=28, year=today.year - 30)

        if dob > max_dob:
            raise forms.ValidationError("You must be at least 18 years old to register.")
        if dob < min_dob:
            raise forms.ValidationError("Age cannot exceed 30 years.")

        return dob

    def clean_photo(self):
        photo = self.cleaned_data.get('photo')
        if photo and hasattr(photo, 'name') and photo.name:
            name = photo.name.lower()
            if not (name.endswith('.jpg') or name.endswith('.jpeg')):
                raise forms.ValidationError("Only JPG and JPEG photo uploads are allowed.")
        return photo
