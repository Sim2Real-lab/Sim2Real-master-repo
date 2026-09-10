from django import forms

class OTPRequestForm(forms.Form):
    email = forms.EmailField()

class SignupOTPVerifyForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'readonly': 'readonly', 'class': 'input'}))
    otp = forms.CharField(max_length=6, min_length=6, widget=forms.TextInput(attrs={'placeholder': 'Enter 6-digit OTP', 'autocomplete': 'one-time-code', 'class': 'input', 'maxlength': '6'}))

class OTPVerifyForm(forms.Form):
    email = forms.EmailField()
    otp = forms.CharField(max_length=6)
    new_password1 = forms.CharField(widget=forms.PasswordInput)
    new_password2 = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('new_password1')
        p2 = cleaned_data.get('new_password2')
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data
