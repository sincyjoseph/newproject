from django.http.response import HttpResponse, HttpResponseServerError
from django.shortcuts import render
from userform.models import UserDetails
from django.views.generic import (
    CreateView, DetailView, ListView,
    UpdateView, TemplateView, View
)
from django.urls import reverse
from django.shortcuts import render
from config.settings import TIME_ZONE as timzon
from datetime import datetime
import pytz
import json
from django.db.models import Q

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import redirect
from django.utils import timezone
import time

# Create your views here.
timeset = pytz.timezone(timzon)

def Userformview(request):
    return render(request,"userform.html")

def Usersubmit(request):
    try:
        if request.method=='POST':
            fname = request.POST.get('firstname')
            lname = request.POST.get('lastname')
            mname = request.POST.get('middlename','')
            email = request.POST.get('email')
            dateofbirth = request.POST.get('dateofbirth')
            gender = request.POST.get('gender')
            country = request.POST.get('country')
            state = request.POST.get('state')
            print(request.FILES.items())
            print(request.POST.dict())
            for key, value in request.FILES.items():
                 file = request.FILES[key]
            userdata_to_db = UserDetails()
            userdata_to_db.fname = fname
            userdata_to_db.lname = lname
            userdata_to_db.mname = mname
            userdata_to_db.dob = dateofbirth
            userdata_to_db.email = email
            userdata_to_db.gender = gender
            userdata_to_db.country = country
            userdata_to_db.state = state
            userdata_to_db.file = file
            userdata_to_db.save()
        return HttpResponse('Successfully submitted user details')
    except:
        return HttpResponseServerError('Submission failed Please try again later')

class UserListView(LoginRequiredMixin, ListView):
    paginate_by = 30
    ordering = ['-pk', ]
    model = UserDetails
    template_name = "userdetailes.html"

class UserListAPIView(View):
    def post(self, request):
        try:
            date_start = self.request.POST.get("date_start", False)
            date_end = self.request.POST.get("date_end", False)
            searchKey = self.request.POST.get("searchKey", False)
            limit = self.request.POST.get("limit", False)
            page = self.request.POST.get("page", False)

            date_start = date_start + ' 00:00:00'
            date_end = date_end + ' 23:59:59'

            first_data = UserDetails.objects.filter(created_datetime__range=(date_start, date_end))

            if searchKey != '':
                first_data = first_data.filter(Q(fname__icontains=searchKey) | Q(gender__icontains=searchKey) | Q(country__icontains=searchKey))

            first_data_reference = first_data

            book_data = list(first_data.values().order_by('-created_datetime'))

            user_details = {
                'all': len(first_data_reference),
            }
            
            if limit and page:
                offset = (int(page) - 1) * int(limit)
                end_offset = offset + int(limit)
                no_item = len(book_data)
                total_page = no_item / int(limit)
                if no_item % int(limit) != 0:
                    total_page += 1
                book_data = book_data[offset:end_offset]
                if len(book_data) == 0:
                    details = {'status': '0', 'error': 'No Data Found'}
                else:
                    details = {
                        'status': '1',
                        'totalPages': int(total_page),
                        'currentPage': page,
                    }
            else:
                details = {"status": "0",
                           "error": "limit or page input missing"}

            return JsonResponse({'status': '1', 'data': book_data, 'pagination': details, 'user_details': user_details})
        except Exception as e:
            print(e)
            return JsonResponse({'status': '0', 'data': str(e), 'user_details': 0})
    
class UserDetailView(LoginRequiredMixin, DetailView):
    model = UserDetails
    template_name = "details-user.html"
    
def UserDeleteView(request):
    try:
        if(request.method == "POST"):
            id = request.POST.get("id")
            userinstance = UserDetails.objects.get(id = id)
            userinstance.delete()
        return JsonResponse({'status' : 1})
    except:
        return JsonResponse({'status' : 0})


class SuccessPage(TemplateView):
    template_name = 'success.html'
    
def media_access(request, path=None):
    """
    When trying to access :
    myproject.com/media/uploads/passport.png

    If access is authorized, the request will be redirected to
    myproject.com/protected/media/uploads/passport.png

    This special URL will be handle by nginx we the help of X-Accel
    """
    # https://b0uh.github.io/protect-django-media-files-per-user-basis-with-nginx.html

    access_granted = False

    user = request.user
    if user.is_authenticated:
        access_granted = True
    else:
        pass

    if access_granted:
        response = HttpResponse()
        # Content-type will be detected by nginx
        del response['Content-Type']
        response['X-Accel-Redirect'] = '/protected/' + path
        return response
    else:
        return HttpResponseForbidden('Not authorized to access this media.')

