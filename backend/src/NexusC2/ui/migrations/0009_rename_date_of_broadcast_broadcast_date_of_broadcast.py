# Generated by Django 4.2.11 on 2024-04-14 18:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ui', '0008_rename_date_of_broadacast_broadcast_date_of_broadcast'),
    ]

    operations = [
        migrations.RenameField(
            model_name='broadcast',
            old_name='date_of_Broadcast',
            new_name='date_of_broadcast',
        ),
    ]
