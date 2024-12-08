import difflib


class MockMismatchError(Exception):
    """Exception raised when the cached output of a prompt was not found in mock mode.

    Attributes:
        prompt : str
            input prompt which caused the error
        mocked_data : list[str]
            list of mocked LLM outputs
    """

    OPEN_ADD = "{+"  # indicates that the following part of the text doesn't exist in the prompt
    OPEN_DEL = "{-"  # indicates that the following part of the prompt doesn't exist in the text
    CLOSE_ALL = "}"  # closes the previous wrapper
    NO_WRAPPER = ""

    MAX_SIMILAR_DATA = 3

    def __init__(self, prompt: str, mocked_data: list[str]):
        self.prompt = prompt
        self.mocked_data = mocked_data
        self.sorted_mocked_data = self.get_sorted_mocked_data()
        self.message = self.build_message()

        super().__init__(self.message)

    # returns a list of potential mock mismatches by decreasing order of similarity to the prompt
    def get_sorted_mocked_data(self):
        sorted_data = sorted(
            self.mocked_data,
            # ratio() returns a measure of the sequences’ similarity as a float in the range [0, 1]
            key=lambda asset: difflib.SequenceMatcher(None, self.prompt, asset).ratio(),
            reverse=True,
        )

        return sorted_data[: self.MAX_SIMILAR_DATA]

    def print_diff(self):
        # https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
        # 92m = green text color
        # 42m = green background color
        GREEN = "\x1b[6;30;92m"
        # 91m = red text color
        # 41m = red background color
        RED = "\x1b[6;30;91m"
        # 0m = reset color
        DEFAULT = "\x1b[0m"

        print(
            self.message.replace(self.OPEN_ADD, GREEN)
            .replace(self.OPEN_DEL, RED)
            .replace(self.CLOSE_ALL, DEFAULT)
        )

    def build_message(self):
        title = "Did not find mock output for text."
        expected_short_title = "Expected one of:"
        expected_long_title = (
            f"Expected one of (first {self.MAX_SIMILAR_DATA} the most similar data):"
        )

        mocked_data_with_titles = [
            f">> Option {i + 1}:\n\n{data}"
            for i, data in enumerate(self.get_highlighted_mocked_data())
        ]
        expected_title = (
            expected_long_title
            if len(self.mocked_data) > self.MAX_SIMILAR_DATA
            else expected_short_title
        )

        expected_data = "\n\n".join(mocked_data_with_titles).replace("\\n", "\n")

        return f"{title}\n\n> Received:\n{self.prompt}\n\n> {expected_title}\n{expected_data}"

    def get_highlighted_mocked_data(self):
        ADD_CHAR = "+"
        DEL_CHAR = "-"
        SAME_CHAR = " "

        mocked_data_with_highlights = []

        get_next_wrapper_and_wrapped_char_by_diff = {
            DEL_CHAR: lambda char, wrapper: (
                self.OPEN_ADD,
                self.get_next_wrapper_and_wrapped_char(
                    char, wrapper, self.OPEN_ADD, self.OPEN_DEL
                ),
            ),
            ADD_CHAR: lambda char, wrapper: (
                self.OPEN_DEL,
                self.get_next_wrapper_and_wrapped_char(
                    char, wrapper, self.OPEN_DEL, self.OPEN_ADD
                ),
            ),
            SAME_CHAR: lambda char, wrapper: (
                self.NO_WRAPPER,
                self.get_next_wrapper_and_wrapped_char(
                    char, wrapper, self.NO_WRAPPER, wrapper
                ),
            ),
        }

        for data in self.sorted_mocked_data:
            line = ""
            wrapper = self.NO_WRAPPER

            for _, s in enumerate(difflib.ndiff(data, self.prompt)):
                diff_type = s[0]
                char = s[-1]
                (
                    next_wrapper,
                    wrapped_char,
                ) = get_next_wrapper_and_wrapped_char_by_diff[diff_type](char, wrapper)
                wrapper = next_wrapper
                line += wrapped_char

            (_, close_wrappers) = get_next_wrapper_and_wrapped_char_by_diff[SAME_CHAR](
                "", wrapper
            )

            mocked_data_with_highlights.append(line + close_wrappers)

        return mocked_data_with_highlights

    def get_next_wrapper_and_wrapped_char(
        self, char=str, cur_wrapper=str, default_wrapper=str, alt_wrapper=str
    ):
        if cur_wrapper == default_wrapper:
            return char

        if cur_wrapper == alt_wrapper:
            return f"{self.CLOSE_ALL}{default_wrapper}{char}"

        return f"{default_wrapper}{char}"

    def __str__(self):
        return self.message
