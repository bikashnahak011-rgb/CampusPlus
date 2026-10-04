import unittest

from pydantic import ValidationError

from backend.routes.push_notifications import PushNotice, _matches_target


class PushTargetTests(unittest.TestCase):
    def test_all_students_matches_any_student_profile(self):
        self.assertTrue(_matches_target("All Students", {"year": 1}))

    def test_department_and_year_targets_match_profile_fields(self):
        profile = {"department": "Computer Science", "branch": "CSE", "year": 2}
        self.assertTrue(_matches_target("Computer Science", profile))
        self.assertTrue(_matches_target("Year 2", profile))
        self.assertFalse(_matches_target("Year 3", profile))

    def test_hostel_and_day_scholar_targets_are_exclusive(self):
        hostel_profile = {"hostel_block": "A"}
        day_profile = {"hostel_block": None}
        self.assertTrue(_matches_target("Hostel", hostel_profile))
        self.assertFalse(_matches_target("Day Scholars", hostel_profile))
        self.assertTrue(_matches_target("Day Scholars", day_profile))

    def test_notice_priority_accepts_all_supported_levels(self):
        for priority in ("critical", "important", "normal"):
            with self.subTest(priority=priority):
                notice = PushNotice(title="Campus update", body="Details", priority=priority)
                self.assertEqual(notice.priority, priority)

    def test_legacy_important_flag_maps_to_important_priority(self):
        notice = PushNotice(title="Campus update", body="Details", important=True)
        self.assertEqual(notice.priority, "important")

    def test_notice_rejects_unknown_priority(self):
        with self.assertRaises(ValidationError):
            PushNotice(title="Campus update", body="Details", priority="urgent")

if __name__ == "__main__":
    unittest.main()
