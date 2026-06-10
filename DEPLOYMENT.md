# Young Investors Deployment Guide

## Stack
- **Frontend:** Vercel (Next.js 15)
- **Backend:** Azure App Service (Django 5 + DRF)
- **Database:** Azure Database for PostgreSQL Flexible Server
- **Email:** SendGrid
- **Media Storage:** Azure App Service local storage (scale to Blob Storage later)

## Prerequisites
1. Azure subscription active
2. Vercel account linked to GitHub
3. SendGrid account with API key
4. Azure CLI installed (`az login`)

## Backend Deployment (Azure App Service)

### Step 1: Create Azure Resources

```bash
# Set variables
RESOURCE_GROUP="yi-resources"
LOCATION="eastus"
APP_SERVICE_PLAN="yi-app-service-plan"
APP_SERVICE="yi-backend"
DB_SERVER="yi-postgres-server"
DB_NAME="young_investors"
DB_USER="yi_user"
DB_PASSWORD="YourSecurePassword123!"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (B1 for dev, B2 for production)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B2 \
  --is-linux

# Create App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE \
  --runtime "python:3.13"

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user $DB_USER \
  --admin-password $DB_PASSWORD \
  --sku-name "Standard_B1ms" \
  --tier "Burstable" \
  --storage-size 32 \
  --high-availability "Disabled"

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER \
  --database-name $DB_NAME
```

### Step 2: Configure App Service

```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE \
  --settings \
    DEBUG="False" \
    SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" \
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_SERVER.postgres.database.azure.com:5432/$DB_NAME?sslmode=require" \
    SENDGRID_API_KEY="$SENDGRID_API_KEY" \
    DEFAULT_FROM_EMAIL="noreply@younginvestors.co" \
    FRONTEND_URL="https://younginvestors.vercel.app" \
    CORS_ALLOWED_ORIGINS="https://younginvestors.vercel.app" \
    CSRF_TRUSTED_ORIGINS="https://younginvestors.vercel.app"

# Enable HTTPS only
az webapp update \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE \
  --https-only true
```

### Step 3: Deploy with GitHub Actions

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths: ['**/*.py', 'requirements.txt', 'Dockerfile']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: yi-backend
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          images: ${{ secrets.REGISTRY_LOGIN_SERVER }}/younginvestors:latest
      
      - name: Run migrations
        run: |
          az webapp ssh --name yi-backend --resource-group yi-resources \
            --command "python manage.py migrate"
```

### Step 4: Run Initial Migrations

```bash
# SSH into App Service
az webapp ssh --name yi-backend --resource-group yi-resources

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

## Frontend Deployment (Vercel)

### Environment Variables in Vercel

Set in Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://yi-backend.azurewebsites.net/api
```

### Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## Database Backup & Restore

```bash
# Backup
pg_dump -h yi-postgres-server.postgres.database.azure.com -U yi_user -d young_investors > backup.sql

# Restore
psql -h yi-postgres-server.postgres.database.azure.com -U yi_user -d young_investors < backup.sql
```

## Monitoring

### Azure Application Insights

```bash
az monitor app-insights component create \
  --app yi-insights \
  --location eastus \
  --resource-group yi-resources \
  --application-type web
```

Add to settings.py:

```python
APPLICATIONINSIGHTS_CONNECTION_STRING = os.environ.get("APPLICATIONINSIGHTS_CONNECTION_STRING")
```

## Scaling

**For higher load:**
1. Upgrade App Service Plan (B2 → P1V2)
2. Enable PostgreSQL auto-scaling
3. Add Azure CDN for static files + media
4. Add Azure Application Gateway for load balancing

## Local Development with Docker

```bash
# Build
docker-compose build

# Start
docker-compose up

# Migrate
docker-compose exec django python manage.py migrate

# Create admin
docker-compose exec django python manage.py createsuperuser
```

## Troubleshooting

### Connection Issues
- Check firewall rules on PostgreSQL: `az postgres flexible-server firewall-rule create ...`
- Verify `sslmode=require` in DATABASE_URL

### Static Files Not Loading
- Run `python manage.py collectstatic --clear --noinput`
- Check WhiteNoiseMiddleware in MIDDLEWARE

### Email Not Sending
- Verify SENDGRID_API_KEY is set
- Check SendGrid dashboard for bounce/suppression lists

## Cost Optimization (Month 1–3)

- **Compute:** B1 or B2 App Service Plan (~$15–50/month)
- **Database:** Burstable PostgreSQL (~$30–60/month)
- **Bandwidth:** First 1TB free from Azure, then $0.087/GB
- **SendGrid:** First 100 emails free, then $0.50/1000 emails

**Estimated monthly: $50–150 USD**
