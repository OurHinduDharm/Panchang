import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "research" / "agastya" / "canopus_twilight_clearance.py"
SPEC = importlib.util.spec_from_file_location("canopus_twilight_clearance", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CanopusTerrainProfileTests(unittest.TestCase):
    def test_interpolates_between_adjacent_azimuth_samples(self):
        profile = [(185.0, 6.0), (185.5, 7.0), (186.0, 6.5)]
        self.assertAlmostEqual(MODULE.interpolate_horizon(profile, 185.25), 6.5)
        self.assertAlmostEqual(MODULE.interpolate_horizon(profile, 185.75), 6.75)

    def test_refuses_to_extrapolate_outside_measured_azimuth_sector(self):
        profile = [(140.0, 2.0), (180.0, 5.0), (220.0, 6.0)]
        self.assertIsNone(MODULE.interpolate_horizon(profile, 139.9))
        self.assertIsNone(MODULE.interpolate_horizon(profile, 220.1))

    def test_reads_each_observer_height_scenario_separately(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "horizon.csv"
            path.write_text(
                "azimuth_deg,horizon_altitude_deg,scenario\n"
                "185.0,6.0,observer_at_dtm_ground_plus_2m\n"
                "185.5,7.0,observer_at_dtm_ground_plus_2m\n"
                "185.0,5.0,observer_at_project_1650m_assumed_egm2008\n"
                "185.5,6.0,observer_at_project_1650m_assumed_egm2008\n",
                encoding="utf-8",
            )
            profiles = MODULE.read_horizon_profiles(str(path))
            self.assertEqual(set(profiles), {
                "observer_at_dtm_ground_plus_2m",
                "observer_at_project_1650m_assumed_egm2008",
            })
            self.assertEqual(len(profiles["observer_at_dtm_ground_plus_2m"]), 2)


if __name__ == "__main__":
    unittest.main()
