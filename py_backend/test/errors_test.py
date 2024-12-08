import unittest
from unittest.mock import patch
from prmx.errors import MockMismatchError


class Test_TestMockMismatchError(unittest.TestCase):
    def build_message(self, mocked_data, expected_message):
        """Test if the message is built correctly for a big list"""
        prompt = "John Doe"
        error = MockMismatchError(prompt, mocked_data)
        highlighted_mocked_data = error.get_highlighted_mocked_data()

        expected_message = (
            "Did not find mock output for text."
            "\n\n> Received:"
            f"\n{prompt}"
            f"\n\n> {expected_message}"
            "\n>> Option 1:"
            f"\n\n{highlighted_mocked_data[0]}"
            "\n\n>> Option 2:"
            f"\n\n{highlighted_mocked_data[1]}"
            "\n\n>> Option 3:"
            f"\n\n{highlighted_mocked_data[2]}"
        )

        self.assertEqual(error.build_message(), expected_message)

    def get_sorted_mocked_data(self, mocked_data, expected_sorted_data):
        """Test if the mocked data is sorted correctly for a big list"""
        prompt = "John Doe"
        error = MockMismatchError(prompt, mocked_data)

        self.assertEqual(error.get_sorted_mocked_data(), expected_sorted_data)

    def test_init(self):
        """Test if the attributes are set correctly"""
        prompt = "John Doe"
        mocked_data = ["Staffany", "Joe Doe", "John Doc"]
        error = MockMismatchError(prompt, mocked_data)

        # Check if attributes are set correctly
        self.assertEqual(error.prompt, prompt)
        self.assertEqual(error.sorted_mocked_data, error.get_sorted_mocked_data())
        self.assertEqual(error.message, error.build_message())
        self.assertEqual(error.args, (error.message,))

    def test_get_sorted_mocked_data(self):
        """Test if the mocked data is sorted correctly"""
        mocked_data = ["Staffany", "Joe Doe", "John Doc"]
        expected_sorted_data = ["John Doc", "Joe Doe", "Staffany"]
        self.get_sorted_mocked_data(mocked_data, expected_sorted_data)

    def test_get_sorted_mocked_data_for_big_list(self):
        """Test if the mocked data is sorted correctly for a big list"""
        mocked_data = ["Staffany", "Joe Doe", "John Doc", "Alex", "Bob", "Cathy"]
        expected_sorted_data = ["John Doc", "Joe Doe", "Bob"]
        self.get_sorted_mocked_data(mocked_data, expected_sorted_data)

    def test_build_message(self):
        """Test if the message is built correctly"""
        mocked_data = ["John Doc", "Joe Doe", "Staffany"]
        self.build_message(mocked_data, "Expected one of:")

    def test_build_message_for_big_list(self):
        """Test if the message is built correctly for a big list"""
        mocked_data = ["Staffany", "Joe Doe", "John Doc", "Alex", "Bob", "Cathy"]
        self.build_message(
            mocked_data, "Expected one of (first 3 the most similar data):"
        )

    def test_get_highlighted_mocked_data(self):
        """Test if the mocked data is highlighted correctly"""
        prompt = "John Doe"
        mocked_data = ["John Doc", "Joe Doe", "Staffany"]
        error = MockMismatchError(prompt, mocked_data)

        # For definition of the markers "{+", "{-", and "}" see the MockMismatchError class
        expected_highlighted_diff = [
            "John Do{+c}{-e}",
            "Jo{+e}{-hn} Doe",
            "{-Joh}{+Staffa}n{+y}{- Doe}",
        ]

        self.assertEqual(error.get_highlighted_mocked_data(), expected_highlighted_diff)

    def test_get_next_wrapper_and_wrapped_char_on_add(self):
        """Test if the next wrapper and wrapped char is returned correctly for add"""
        error = MockMismatchError("", [])

        test_char = "a"

        char_with_open_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.NO_WRAPPER, error.OPEN_ADD, error.OPEN_DEL
        )
        char_with_no_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_ADD, error.OPEN_ADD, error.OPEN_DEL
        )
        char_with_close_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_DEL, error.OPEN_ADD, error.OPEN_DEL
        )

        self.assertEqual(char_with_open_wrapper, error.OPEN_ADD + test_char)
        self.assertEqual(char_with_no_wrapper, test_char)
        self.assertEqual(
            char_with_close_wrapper, error.CLOSE_ALL + error.OPEN_ADD + test_char
        )

    def test_get_next_wrapper_and_wrapped_char_on_del(self):
        """Test if the next wrapper and wrapped char is returned correctly for del"""
        error = MockMismatchError("", [])

        test_char = "a"

        char_with_open_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.NO_WRAPPER, error.OPEN_DEL, error.OPEN_ADD
        )
        char_with_no_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_DEL, error.OPEN_DEL, error.OPEN_ADD
        )
        char_with_close_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_ADD, error.OPEN_DEL, error.OPEN_ADD
        )

        self.assertEqual(char_with_open_wrapper, error.OPEN_DEL + test_char)
        self.assertEqual(char_with_no_wrapper, test_char)
        self.assertEqual(
            char_with_close_wrapper, error.CLOSE_ALL + error.OPEN_DEL + test_char
        )

    def test_get_next_wrapper_and_wrapped_char_on_no_action(self):
        """Test if the next wrapper and wrapped char is returned correctly for no action"""
        error = MockMismatchError("", [])

        test_char = "a"

        char_with_no_wrapper = error.get_next_wrapper_and_wrapped_char(
            test_char, error.NO_WRAPPER, error.NO_WRAPPER, error.NO_WRAPPER
        )
        char_with_close_wrapper_1 = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_ADD, error.NO_WRAPPER, error.OPEN_ADD
        )
        char_with_close_wrapper_2 = error.get_next_wrapper_and_wrapped_char(
            test_char, error.OPEN_DEL, error.NO_WRAPPER, error.OPEN_DEL
        )

        self.assertEqual(char_with_no_wrapper, test_char)
        self.assertEqual(char_with_close_wrapper_1, error.CLOSE_ALL + test_char)
        self.assertEqual(char_with_close_wrapper_2, error.CLOSE_ALL + test_char)

    @patch("builtins.print")  # Mock the built-in print function
    def test_mock_mismatch_error_print_diff(self, mock_print):
        """Test if the print_diff method prints the correct message"""
        prompt = "John Doe"
        mocked_data = ["John Doc", "Jack Doe", "Joe Doe"]
        error = MockMismatchError(prompt, mocked_data)

        # Call the method that contains the print statements
        error.print_diff()

        # Assert that print was called with the expected parameters
        expected_message = (
            "Did not find mock output for text."
            "\n\n> Received:"
            "\nJohn Doe"
            "\n\n> Expected one of:"
            "\n>> Option 1:"
            "\n\nJohn Do\x1b[6;30;92mc\x1b[0m\x1b[6;30;91me\x1b[0m"
            "\n\n>> Option 2:"
            "\n\nJo\x1b[6;30;92me\x1b[0m\x1b[6;30;91mhn\x1b[0m Doe"
            "\n\n>> Option 3:"
            "\n\nJ\x1b[6;30;92mack\x1b[0m\x1b[6;30;91mohn\x1b[0m Doe"
        )
        mock_print.assert_called_with(expected_message)


if __name__ == "__main__":
    unittest.main()
