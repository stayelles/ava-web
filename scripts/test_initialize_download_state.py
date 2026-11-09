import ftplib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import Mock

spec = importlib.util.spec_from_file_location("release_state", Path(__file__).with_name("initialize-download-state.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ReleaseStateTests(unittest.TestCase):
    def test_existing_state_is_never_replaced(self):
        ftp = Mock()
        ftp.size.return_value = 123
        self.assertFalse(module.initialize(ftp, "1.5.76"))
        ftp.storbinary.assert_not_called()

    def test_permission_failure_does_not_overwrite_an_existing_file(self):
        ftp = Mock()
        ftp.size.side_effect = ftplib.error_perm("550 unavailable")
        ftp.nlst.return_value = ["/public_html/downloads/.ftp-deploy-desktop-1.5.76.json"]
        with self.assertRaises(RuntimeError):
            module.initialize(ftp, "1.5.76")
        ftp.storbinary.assert_not_called()

    def test_new_release_starts_empty_without_deleting_previous_files(self):
        ftp = Mock()
        ftp.size.side_effect = ftplib.error_perm("550 absent")
        ftp.nlst.return_value = ["AvaSetup-1.5.74.exe"]
        self.assertTrue(module.initialize(ftp, "1.5.76"))
        command, stream = ftp.storbinary.call_args.args
        self.assertEqual(command, "STOR .ftp-deploy-desktop-1.5.76.json")
        self.assertEqual(json.loads(stream.getvalue())["data"], [])
        ftp.delete.assert_not_called()

    def test_invalid_version_cannot_construct_an_ftp_path(self):
        ftp = Mock()
        with self.assertRaises(ValueError):
            module.initialize(ftp, "../other")
        self.assertFalse(ftp.mock_calls)
