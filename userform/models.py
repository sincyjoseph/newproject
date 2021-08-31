from django.db import models
from django.conf import settings

# Create your models here.
class UserDetails(models.Model):
    fname =  models.CharField(("Fname"),max_length=100, null=True, blank=True)

    lname =  models.CharField(("Lname"),max_length=100, null=True, blank=True)

    mname = models.CharField(("Mname"),max_length=100, null=True, blank=True)

    dob = models.DateField(("DOB"), null=True, blank=True)
    
    email = models.CharField(("Email"),max_length=100,null=True, blank=True)

    gender = models.CharField(("Gender"),max_length=50,null=True, blank=True)

    country = models.CharField(("Country"),max_length=50,null=True, blank=True)

    state = models.CharField(("State"),max_length=50,null=True, blank=True)

    file = models.FileField(("File"), upload_to=settings.UPLOAD_TO_FOLDER, max_length=100, null=True, blank=True)

    created_datetime = models.DateTimeField(auto_now_add=True)

    modified_datetime = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = ("Userdetails")
        verbose_name_plural = ("Userdetails")

    def __str__(self):
        return self.fname or '------'
