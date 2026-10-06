from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('staff_home', '0013_merge_20261005_2246'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, default=500.0, help_text='Registration fee amount in INR', max_digits=10)),
                ('payee_name', models.CharField(default='Sim2Real Robotech NITK', help_text='Payee / Account Name', max_length=150)),
                ('qr_code', models.ImageField(blank=True, help_text='UPI QR Code image', null=True, upload_to='payment_qr/')),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
