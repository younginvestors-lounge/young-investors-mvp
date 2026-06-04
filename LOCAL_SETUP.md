# Young Investors — Local Development Setup

## Prerequisites
- Python 3.13
- Node.js 18+
- Git

## Backend Setup (Django)

### 1. Install dependencies
```bash
cd /path/to/young-investors-mvp
pip install -r requirements.txt
```

### 2. Configure environment
Create `.env` with:
```
DEBUG=True
SECRET_KEY=local-dev-secret-replace-before-production-32chars
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
SENDGRID_API_KEY=not-needed-for-local-file-email
DEFAULT_FROM_EMAIL=noreply@younginvestors.co
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=.local-emails
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Migrate database
```bash
python manage.py migrate
```

### 4. Create superuser (optional, for Django admin)
```bash
python manage.py createsuperuser
```

### 5. Start Django dev server
```bash
python manage.py runserver 0.0.0.0:8000
```

Backend is now at `http://127.0.0.1:8000`

### 6. Test auth endpoints
```bash
# Signup
curl -X POST http://127.0.0.1:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "username":"testchef",
    "password":"TestPass123!",
    "password_confirm":"TestPass123!",
    "chef_alias":"Test Chef",
    "age":25,
    "intent":"learn_craft"
  }'

# Response: {"message": "Account created. Please check your email to verify.", "user": {...}}
# Local email outbox: .local-emails/ contains the verification email

# Get the token from the local email outbox and verify email
curl -X POST http://127.0.0.1:8000/api/auth/verify_email/ \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL"}'

# Response: {"message": "Email verified. You can now log in."}

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }'

# Response: {"access": "JWT_TOKEN", "refresh": "REFRESH_TOKEN", "user": {...}}

# Get current user (authenticated)
curl -X GET http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Bearer JWT_TOKEN"

# Update profile (add chef alias, profile icon, or picture)
curl -X PATCH http://127.0.0.1:8000/api/auth/update_profile/ \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chef_alias":"New Name",
    "profile_icon":"flame"
  }'
```

## Frontend Setup (Next.js)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Start dev server
```bash
npm run dev
```

Frontend is now at `http://localhost:3000`

## Testing Auth Flow

### Complete signup → verify → login → profile journey

1. **Open frontend:** http://localhost:3000
2. **Click "Start your journey"** → redirects to /onboarding
3. **Fill onboarding form:**
   - Name: "Your Name"
   - Age: 25
   - Intent: "Learn the craft"
4. **Submit** → backend creates ChefUser, sends verification email
5. **Check `.local-emails/`** for the verification email with token
6. **Copy token** into verification link or call endpoint manually
7. **Verify email** → backend marks user as verified
8. **Automatic login redirect** → /kitchen with JWT token
9. **JWT stored** in localStorage (`yi_access_token`)
10. **Test profile update:**
    - Edit chef alias or select profile icon
    - Submit → backend PATCH /api/auth/update_profile
    - Profile picture saves to media/profile_pictures/

## Troubleshooting

### "Connection refused" (backend not running)
```bash
# Ensure backend is running
python manage.py runserver 0.0.0.0:8000
```

### "CORS error" in frontend console
- Check `CORS_ALLOWED_ORIGINS` in settings.py includes frontend URL
- Restart Django after changing CORS settings

### "Email verification token not found"
- Check `.local-emails/` for the email body
- Copy the full token (everything after `token=` in the URL)
- Ensure token hasn't expired (24 hours)

### "Profile picture upload fails"
- Ensure media/ directory exists: `mkdir -p media/profile_pictures/`
- Check file size < 5MB
- Verify MEDIA_ROOT, MEDIA_URL in settings.py

### "Database locked" or migrations error
```bash
# Clear and rebuild
rm db.sqlite3
python manage.py migrate
```

## Docker (optional, for Postgres-like local dev)

```bash
docker-compose up
# Postgres at localhost:5432
# Django at 0.0.0.0:8000
```

## Next Steps

Once local auth flow is verified:

1. **Run full smoke test:**
   - Sign up with email/password
   - Verify email from the local email outbox
   - Login → JWT token
   - Update profile with icon
   - Logout → localStorage cleared
   - Login again → JWT restored

2. **Prepare Azure staging checklist:**
   - Create resource group, App Service, PostgreSQL, SendGrid
   - Set environment variables in Azure
   - Deploy Django to App Service
   - Run migrations on Azure Postgres
   - Deploy frontend to Vercel with prod API URL
   - Test full auth flow on staging

3. **Do NOT deploy to production until:**
   - Local auth fully working
   - Azure staging tested
   - All endpoints verified
   - No CORS/CSRF errors
   - Security review complete

## Success Criteria (Local Integration)

✅ Backend runs without errors
✅ Frontend runs without errors
✅ Signup creates user in database
✅ Email verification email appears in `.local-emails/`
✅ Verify email endpoint marks user as verified
✅ Login returns JWT tokens
✅ JWT stored in localStorage
✅ Profile update saves chef alias/icon
✅ Profile picture uploads to media/
✅ Onboarding routes to /kitchen after profile
✅ No CORS errors in browser console
✅ No routing breaks (all links work)
✅ Logout clears tokens
✅ Login works again after logout

## Security Notes (Dev Only)

⚠️ This setup uses:
- **File email backend** (no SendGrid needed)
- **SQLite** (no Postgres needed)
- **AllowAny permissions** (DRF auth optional, loosen for demo)
- **DEBUG=True** (never use in production)

For production:
- Switch to SendGrid backend with API key
- Use Azure PostgreSQL Flexible Server
- Require JWT authentication
- Set DEBUG=False
- Enable HTTPS only
- Implement rate limiting
- Add CSRF middleware
