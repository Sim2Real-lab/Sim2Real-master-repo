from django import forms
from .models import Team
from staff_home.models import Track

class TeamCreationForm(forms.ModelForm):
    track = forms.ModelChoiceField(
        queryset=Track.objects.all(),
        required=True,
        empty_label="-- Select Competition Track --",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    agree_policy = forms.BooleanField(
        required=True,
        error_messages={'required': 'You must accept the Code of Conduct, Privacy Policy, and Terms & Conditions to create a team.'}
    )

    class Meta:
        model = Team
        fields = ['name', 'track']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure Sim2Real & Sim2Real Ideathon exist in DB
        if not Track.objects.filter(name__icontains="Sim2Real").exists():
            Track.objects.get_or_create(name="Sim2Real", defaults={'qualifying_status': 'approved', 'enabled': True, 'order': 1})
            Track.objects.get_or_create(name="Sim2Real Ideathon", defaults={'qualifying_status': 'approved', 'enabled': True, 'order': 2})
        self.fields['track'].queryset = Track.objects.exclude(name='Default Track').order_by('order', 'name')
        if not self.fields['track'].queryset.exists():
            self.fields['track'].queryset = Track.objects.all()

class JoinCodeForm(forms.Form):
    join_code = forms.UUIDField(label="Join Code", widget=forms.TextInput(attrs={'placeholder': 'Enter 36-character Join Code', 'class': 'form-control'}))


class PaymentProofForm(forms.ModelForm):
    class Meta:
        model = Team
        fields = ['payment_ref', 'payment_screenshot']
        widgets = {
            'payment_ref': forms.TextInput(attrs={'placeholder': 'Enter UPI Reference Number', 'class': 'form-control'}),
        }
    
    def clean_payment_screenshot(self):
        file = self.cleaned_data.get("payment_screenshot")
        if file:
            ext = file.name.lower().split('.')[-1]
            if ext not in ['png', 'jpg', 'jpeg']:
                raise forms.ValidationError("Only .png, .jpg, and .jpeg files are allowed for payment proof.")
        return file