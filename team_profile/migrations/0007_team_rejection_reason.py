from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('team_profile', '0006_team_track'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='rejection_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
