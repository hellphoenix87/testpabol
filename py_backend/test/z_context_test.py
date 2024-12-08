"""
Run this test as last as it is testing the context and
it is modifying profile configuration via environment variables.
"""

import os
from unittest import TestCase, main, mock
from prmx import context as ctx


def clean():
    if "PRMX_PROFILE" in os.environ:
        del os.environ["PRMX_PROFILE"]


class Test_TestConfig(TestCase):
    def __init__(self, methodName: str = ...) -> None:
        super().__init__(methodName)

    def test_default_profile(self):
        clean()
        self.assertEqual(ctx.Config().name, "default")

    @mock.patch.dict("os.environ", {"PRMX_PROFILE": "test"})
    def test_environment_profile(self):
        self.assertEqual(ctx.Config().name, "test")

    def test_argument_profile(self):
        self.assertEqual(ctx.Config(profile="test").name, "test")

    @mock.patch.dict("os.environ", {"PRMX_PROFILE": "test"})
    def test_argument_precedence_in_object(self):
        self.assertEqual(ctx.Config(profile="mock").name, "mock")

    def test_environment_propagation(self):
        clean()
        self.assertFalse("PRMX_PROFILE" in os.environ)
        ctx.Config(profile="mock")
        self.assertEqual(os.environ["PRMX_PROFILE"], "mock")

    @mock.patch.dict("os.environ", {"PRMX_PROFILE": "test"})
    def test_environment_precedence_outside_object(self):
        ctx.Config(profile="mock")
        self.assertEqual(os.environ["PRMX_PROFILE"], "test")

    @mock.patch.dict("os.environ", {"PRMX_PROFILE": "test"})
    def test_forced_environment_override(self):
        ctx.Config(profile="mock", force=True)
        self.assertEqual(os.environ["PRMX_PROFILE"], "mock")

    # does not check nested keys for flexibility
    def test_matching_schemas(self):
        profiles = ctx.Config().profiles
        names = list(profiles.keys())
        reference = profiles[names[0]].keys()
        for name in names[1:]:
            self.assertEqual(reference, profiles[name].keys())

    def test_types(self):
        profiles = ctx.Config().profiles
        for value in profiles.values():
            for k, v in value.items():
                if k in ["scenes", "shots"]:
                    self.assertTrue(isinstance(v, int))
                elif k in ["mock_generative_apis", "log_llm_prompts"]:
                    self.assertTrue(isinstance(v, bool))


if __name__ == "__main__":
    main()
