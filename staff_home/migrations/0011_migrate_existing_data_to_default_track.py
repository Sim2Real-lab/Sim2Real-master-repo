from django.db import migrations

def create_default_track_and_link(apps, schema_editor):
    Track = apps.get_model('staff_home', 'Track')
    ProblemStatementConfig = apps.get_model('staff_home', 'ProblemStatementConfig')
    ProblemStatementSection = apps.get_model('staff_home', 'ProblemStatementSection')
    Resource = apps.get_model('staff_home', 'Resource')
    Team = apps.get_model('team_profile', 'Team')

    # Get or create a default track
    config_1 = ProblemStatementConfig.objects.filter(id=1).first()
    default_enabled = config_1.enabled if config_1 else False
    default_file = config_1.file if config_1 else None

    default_track, created = Track.objects.get_or_create(
        name="Default Track",
        defaults={
            "description": "Default competition track",
            "enabled": default_enabled,
            "file": default_file,
            "qualifying_status": "Pending",
            "order": 1,
        }
    )

    # Link existing config to default track
    if config_1 and not config_1.track:
        config_1.track = default_track
        config_1.save()

    # Link sections to default track
    for section in ProblemStatementSection.objects.filter(track__isnull=True):
        section.track = default_track
        section.save()

    # Link resources to default track
    for resource in Resource.objects.filter(track__isnull=True):
        resource.track = default_track
        resource.save()

    # Link existing teams to default track
    for team in Team.objects.filter(track__isnull=True):
        team.track = default_track
        team.save()

def reverse_migration(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('staff_home', '0010_track_resource_description_and_more'),
        ('team_profile', '0006_team_track'),
    ]

    operations = [
        migrations.RunPython(create_default_track_and_link, reverse_code=reverse_migration),
    ]
