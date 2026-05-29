from django.db import migrations


MOCK_MVP_JSE_TOP40_ASSETS = [
    ("AGL", "Anglo American plc"),
    ("AMS", "Anglo American Platinum Ltd"),
    ("ANG", "AngloGold Ashanti plc"),
    ("ANH", "Anheuser-Busch InBev SA/NV"),
    ("APN", "Aspen Pharmacare Holdings Ltd"),
    ("BID", "Bid Corporation Ltd"),
    ("BHG", "BHP Group Ltd"),
    ("BTI", "British American Tobacco plc"),
    ("BVT", "The Bidvest Group Ltd"),
    ("CFR", "Compagnie Financiere Richemont SA"),
    ("CLS", "Clicks Group Ltd"),
    ("CPI", "Capitec Bank Holdings Ltd"),
    ("DSY", "Discovery Ltd"),
    ("EXX", "Exxaro Resources Ltd"),
    ("FSR", "Firstrand Ltd"),
    ("GLN", "Glencore plc"),
    ("GFI", "Gold Fields Ltd"),
    ("HAR", "Harmony Gold Mining Company Ltd"),
    ("IMP", "Impala Platinum Holdings Ltd"),
    ("INP", "Investec plc"),
    ("KIO", "Kumba Iron Ore Ltd"),
    ("MCG", "MultiChoice Group Ltd"),
    ("MNP", "Mondi plc"),
    ("MRP", "Mr Price Group Ltd"),
    ("MTN", "MTN Group Ltd"),
    ("NED", "Nedbank Group Ltd"),
    ("NPN", "Naspers Ltd"),
    ("NRP", "NEPI Rockcastle N.V."),
    ("OMU", "Old Mutual Ltd"),
    ("PPH", "Pepkor Holdings Ltd"),
    ("PRX", "Prosus N.V."),
    ("REM", "Remgro Ltd"),
    ("RNI", "Reinet Investments S.C.A."),
    ("SBK", "Standard Bank Group Ltd"),
    ("SHP", "Shoprite Holdings Ltd"),
    ("SLM", "Sanlam Ltd"),
    ("SOL", "Sasol Ltd"),
    ("SSW", "Sibanye Stillwater Ltd"),
    ("VOD", "Vodacom Group Ltd"),
    ("WHL", "Woolworths Holdings Ltd"),
]


def seed_mock_assets(apps, schema_editor):
    PermittedAsset = apps.get_model("marketdata", "PermittedAsset")
    for symbol, name in MOCK_MVP_JSE_TOP40_ASSETS:
        PermittedAsset.objects.update_or_create(
            exchange="JSE",
            index_code="TOP40",
            symbol=symbol,
            defaults={
                "name": name,
                "currency": "ZAR",
                "is_active": True,
                "metadata": {"source": "MOCK_MVP_PERMITTED_LIST"},
            },
        )


def unseed_mock_assets(apps, schema_editor):
    PermittedAsset = apps.get_model("marketdata", "PermittedAsset")
    PermittedAsset.objects.filter(
        exchange="JSE",
        index_code="TOP40",
        symbol__in=[symbol for symbol, _name in MOCK_MVP_JSE_TOP40_ASSETS],
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("marketdata", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_mock_assets, unseed_mock_assets),
    ]
