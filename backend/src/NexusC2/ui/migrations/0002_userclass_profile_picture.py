# Generated by Django 4.2.11 on 2024-04-13 13:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ui', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userclass',
            name='profile_picture',
            field=models.ImageField(default='../../public/User.png', upload_to='profile_pictures/'),
        ),
    ]
