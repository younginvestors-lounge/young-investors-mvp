from django.db import migrations


def seed_required_modules(apps, schema_editor):
    AcademyModule = apps.get_model("academy", "AcademyModule")
    modules = [
        ("financial-markets", "Financial Markets"),
        ("risk-management", "Risk Management"),
    ]
    for code, title in modules:
        AcademyModule.objects.update_or_create(
            code=code,
            defaults={"title": title, "is_required_mvp": True},
        )


def unseed_required_modules(apps, schema_editor):
    AcademyModule = apps.get_model("academy", "AcademyModule")
    AcademyModule.objects.filter(code__in=["financial-markets", "risk-management"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("academy", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_required_modules, unseed_required_modules),
    ]
