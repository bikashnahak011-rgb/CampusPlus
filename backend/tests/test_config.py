import unittest

from backend.config import Settings


class CorsOriginTests(unittest.TestCase):
    def test_normalizes_bare_hosts_and_trailing_slashes(self):
        settings = Settings(
            supabase_url="https://example.supabase.co",
            supabase_service_role_key="test-key",
            cors_origins="campus-plus-zeta.vercel.app/,localhost:5173,http://127.0.0.1:5173/",
        )

        self.assertEqual(
            settings.allowed_origins,
            [
                "https://campus-plus-zeta.vercel.app",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ],
        )


if __name__ == "__main__":
    unittest.main()