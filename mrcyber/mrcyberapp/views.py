from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from .models import ContactMessage

def home(request):
    return render(request, 'mrcyberapp/home.html')


@require_POST
def contact_submit(request):
    name = request.POST.get("name", "").strip()
    email = request.POST.get("email", "").strip()
    subject = request.POST.get("subject", "").strip()
    message = request.POST.get("message", "").strip()

    if name and email and message:
        ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message,
        )
        # sadə redirect + query param ile “thanks” mesajı göstərə bilərik
        return redirect(f"{request.META.get('HTTP_REFERER', '/')}?contact=ok")

    return redirect(f"{request.META.get('HTTP_REFERER', '/')}?contact=error")