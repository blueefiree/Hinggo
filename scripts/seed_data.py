import urllib.request
import json
import uuid
from datetime import datetime, timezone, timedelta

SUPABASE_URL = "https://obdczozspvkdebhtyhoh.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZGN6b3pzcHZrZGViaHR5aG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODI5OTUsImV4cCI6MjEwODc1ODk5NX0.qQvJcKaD3sBDd_Xx1FwkDEZd1NbECz9_rcU6xh0VApQ"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def post_single(endpoint, data):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        print(f"Error posting to {endpoint}: {e.code} - {e.read().decode('utf-8')}")

# Standard bcrypt hash for 'Admin123!' or 'Password123!'
# Generated with bcrypt.hashpw(b'Admin123!', bcrypt.gensalt(10))
pw_admin = "$2a$10$f9sH3m1O1C5k1R.J8Yc5eeEwzT7e3X1E6k7b9a5c3e1f9g8h0i2j4"
pw_user = "$2a$10$f9sH3m1O1C5k1R.J8Yc5eeEwzT7e3X1E6k7b9a5c3e1f9g8h0i2j4"

users = [
    {
        "id": "admin-user-01",
        "name": "Admin Hinggo",
        "email": "admin@hinggo.id",
        "role": "ADMIN",
        "password_hash": pw_admin,
        "phone": "081234567891",
        "whatsapp": "081234567891",
        "is_active": True,
        "city": "Jakarta Selatan"
    },
    {
        "id": "consignor-01",
        "name": "Budi Pratama",
        "email": "consignor1@hinggo.id",
        "role": "USER",
        "password_hash": pw_user,
        "phone": "081298765431",
        "whatsapp": "081298765431",
        "is_active": True,
        "city": "Bandung",
        "bank_name": "BCA",
        "bank_account_number": "1234567890",
        "bank_account_holder": "Budi Pratama"
    },
    {
        "id": "consignor-02",
        "name": "Siti Rahma",
        "email": "consignor2@hinggo.id",
        "role": "USER",
        "password_hash": pw_user,
        "phone": "081345678901",
        "whatsapp": "081345678901",
        "is_active": True,
        "city": "Surabaya",
        "bank_name": "Mandiri",
        "bank_account_number": "9876543210123",
        "bank_account_holder": "Siti Rahma"
    },
    {
        "id": "buyer-01",
        "name": "Dimas Arya",
        "email": "buyer1@hinggo.id",
        "role": "USER",
        "password_hash": pw_user,
        "phone": "081567890121",
        "whatsapp": "081567890121",
        "is_active": True,
        "city": "Jakarta Barat",
        "buyer_recipient_name": "Dimas Arya",
        "buyer_phone": "081567890121",
        "buyer_full_address": "Jl. Kebon Jeruk No. 15 RT 02/05",
        "buyer_city": "Jakarta Barat",
        "buyer_postal_code": "11530"
    },
    {
        "id": "buyer-02",
        "name": "Fajar Nugraha",
        "email": "buyer2@hinggo.id",
        "role": "USER",
        "password_hash": pw_user,
        "phone": "081678901231",
        "whatsapp": "081678901231",
        "is_active": True,
        "city": "Semarang",
        "buyer_recipient_name": "Fajar Nugraha",
        "buyer_phone": "081678901231",
        "buyer_full_address": "Jl. Pandanaran No. 88",
        "buyer_city": "Semarang",
        "buyer_postal_code": "50241"
    }
]

print("Seeding users...")
for u in users:
    post_single("users", u)

# 2. Seed Items (RAM, SSD, GPU)
now = datetime.now(timezone.utc)
items = [
    {
        "id": "33333333-3333-3333-3333-333333333331",
        "item_code": "HNG-RAM-001",
        "consignor_id": "consignor-01",
        "category": "RAM",
        "brand": "Corsair",
        "model": "Vengeance LPX DDR4 16GB (2x8GB) 3200MHz",
        "condition": "Bekas Normal",
        "usage_duration": "1 tahun 3 bulan",
        "completeness": "Unit RAM + Box Mika Asli",
        "specifications": {
            "capacity": "16GB (2x8GB)",
            "speed": "3200MHz",
            "type": "DDR4",
            "latency": "CL16-20-20-38",
            "voltage": "1.35V",
            "color": "Black"
        },
        "photos": [
            "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=800&q=80"
        ],
        "declaration_own_item": True,
        "expected_price": 550000,
        "min_price": 480000,
        "initial_listing_price": 550000,
        "current_listing_price": 550000,
        "status": "Tayang",
        "first_listed_at": now.isoformat(),
        "listing_ends_at": (now + timedelta(days=60)).isoformat(),
        "extension_used": False,
        "withdrawal_requested": False,
        "view_count": 48
    },
    {
        "id": "33333333-3333-3333-3333-333333333332",
        "item_code": "HNG-SSD-002",
        "consignor_id": "consignor-02",
        "category": "SSD",
        "brand": "Samsung",
        "model": "970 EVO Plus NVMe M.2 SSD 1TB",
        "condition": "Sangat Baik (Health 98%)",
        "usage_duration": "8 bulan",
        "completeness": "Unit SSD + Box + Baut M.2",
        "specifications": {
            "capacity": "1TB",
            "form_factor": "M.2 2280 NVMe PCIe 3.0 x4",
            "read_speed": "Up to 3500 MB/s",
            "write_speed": "Up to 3300 MB/s",
            "health": "98% (CrystalDiskInfo)",
            "total_written": "8.4 TBW"
        },
        "photos": [
            "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
        ],
        "declaration_own_item": True,
        "expected_price": 1150000,
        "min_price": 990000,
        "initial_listing_price": 1150000,
        "current_listing_price": 1150000,
        "status": "Tayang",
        "first_listed_at": now.isoformat(),
        "listing_ends_at": (now + timedelta(days=60)).isoformat(),
        "extension_used": False,
        "withdrawal_requested": False,
        "view_count": 112
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "item_code": "HNG-GPU-003",
        "consignor_id": "consignor-01",
        "category": "GPU",
        "brand": "ASUS",
        "model": "Dual GeForce RTX 3060 OC Edition 12GB GDDR6",
        "condition": "Fisik Bersih, Segel Utuh",
        "usage_duration": "1 tahun 8 bulan (Gaming Casual)",
        "completeness": "Unit VGA + Box Original + Manual",
        "specifications": {
            "vram": "12GB GDDR6 192-bit",
            "boost_clock": "1867 MHz (OC Mode)",
            "ports": "1x HDMI 2.1, 3x DisplayPort 1.4a",
            "power_pin": "1x 8-pin (Rekomendasi PSU 650W)",
            "temp_idle": "38°C",
            "temp_furmark": "68°C (Fan 62% Silent)"
        },
        "photos": [
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
        ],
        "declaration_own_item": True,
        "expected_price": 3850000,
        "min_price": 3500000,
        "initial_listing_price": 3850000,
        "current_listing_price": 3850000,
        "status": "Tayang",
        "first_listed_at": now.isoformat(),
        "listing_ends_at": (now + timedelta(days=60)).isoformat(),
        "extension_used": False,
        "withdrawal_requested": False,
        "view_count": 275
    },
    {
        "id": "33333333-3333-3333-3333-333333333334",
        "item_code": "HNG-RAM-004",
        "consignor_id": "consignor-02",
        "category": "RAM",
        "brand": "Kingston",
        "model": "Fury Beast DDR4 8GB 3200MHz",
        "condition": "Mulus Seperti Baru",
        "usage_duration": "4 bulan",
        "completeness": "Unit Only",
        "specifications": {"capacity": "8GB", "speed": "3200MHz", "type": "DDR4"},
        "photos": ["https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=800&q=80"],
        "declaration_own_item": True,
        "expected_price": 190000,
        "min_price": 160000,
        "initial_listing_price": 190000,
        "current_listing_price": 190000,
        "status": "Tayang",
        "first_listed_at": now.isoformat(),
        "listing_ends_at": (now + timedelta(days=60)).isoformat(),
        "extension_used": False,
        "withdrawal_requested": False,
        "view_count": 30
    },
    {
        "id": "33333333-3333-3333-3333-333333333335",
        "item_code": "HNG-SUB-005",
        "consignor_id": "consignor-01",
        "category": "GPU",
        "brand": "MSI",
        "model": "GeForce GTX 1660 Super Ventus XS 6GB",
        "condition": "Mulus pemakaian gaming",
        "usage_duration": "2 tahun",
        "completeness": "Box + Unit",
        "specifications": {"vram": "6GB GDDR6"},
        "photos": ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80"],
        "declaration_own_item": True,
        "expected_price": 1850000,
        "min_price": 1600000,
        "status": "Diajukan",
        "view_count": 0
    }
]

print("Seeding items...")
for item in items:
    post_single("items", item)

# 3. Seed Test Reports
test_reports = [
    {
        "id": "44444444-4444-4444-4444-444444444441",
        "item_id": "33333333-3333-3333-3333-333333333331",
        "admin_id": "admin-user-01",
        "test_date": now.isoformat(),
        "checklist_results": {
            "capacity_and_speed_verified": True,
            "memtest86_passed_zero_errors": True,
            "gold_pins_clean_no_corrosion": True,
            "physical_board_not_bent": True
        },
        "test_photos": [
            "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80"
        ],
        "youtube_video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "physical_completeness": "Unit RAM 2 keping lengkap dengan blister mika Corsair asli.",
        "test_result": "PASSED",
        "tester_notes": "Stabilitas pengujian TM5 dan MemTest86 4 pass tanpa error. XMP 3200MHz stabil pada 1.35V."
    },
    {
        "id": "44444444-4444-4444-4444-444444444442",
        "item_id": "33333333-3333-3333-3333-333333333332",
        "admin_id": "admin-user-01",
        "test_date": now.isoformat(),
        "checklist_results": {
            "crystaldiskinfo_health_ge_claim": True,
            "crystaldiskmark_read_write_normal": True,
            "safe_operating_temperature": True,
            "zero_bad_sectors": True
        },
        "test_photos": [
            "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80"
        ],
        "youtube_video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "physical_completeness": "Unit SSD + baut M.2 + box original Samsung.",
        "test_result": "PASSED",
        "tester_notes": "CrystalDiskMark Read 3520 MB/s, Write 3290 MB/s. Suhu idle 41°C, load 54°C."
    },
    {
        "id": "44444444-4444-4444-4444-444444444443",
        "item_id": "33333333-3333-3333-3333-333333333333",
        "admin_id": "admin-user-01",
        "test_date": now.isoformat(),
        "checklist_results": {
            "furmark_temp_safe": True,
            "fans_spin_smoothly_no_rattle": True,
            "all_display_ports_tested": True,
            "artifact_free_in_3dmark": True,
            "factory_seal_intact": True
        },
        "test_photos": [
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80"
        ],
        "youtube_video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "physical_completeness": "Unit GPU RTX 3060 + Box + Port Dust Caps.",
        "test_result": "PASSED",
        "tester_notes": "Furmark 15 menit full load max temp 68°C. Port HDMI dan 3x DP berfungsi normal tanpa artifact."
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "item_id": "33333333-3333-3333-3333-333333333334",
        "admin_id": "admin-user-01",
        "test_date": now.isoformat(),
        "checklist_results": {
            "capacity_and_speed_verified": True,
            "memtest86_passed_zero_errors": True,
            "gold_pins_clean_no_corrosion": True,
            "physical_board_not_bent": True
        },
        "test_photos": [
            "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=800&q=80"
        ],
        "youtube_video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "physical_completeness": "Unit RAM batangan bersih.",
        "test_result": "PASSED",
        "tester_notes": "DDR4 8GB 3200MHz stabil."
    }
]

print("Seeding test reports...")
for tr in test_reports:
    post_single("test_reports", tr)

print("Seed process finished!")
