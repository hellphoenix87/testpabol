""" Decorators encapsulate generic execution before and/or after a function call.
They add functionality to existing functions without modifying the function itself.
"""

import os
import time
import inspect
import sys
from functools import wraps
from prmx.datastore_local import DatastoreLocal


def timer(func: callable) -> callable:
    """annotate functions with @timer to echo execution time"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        elapsed = end - start
        print(f"@timer: ran {func.__name__} in {elapsed:.3f}s")
        return result

    return wrapper


def io_record(enabled: bool = False) -> callable:
    """decorator saving arguments & returned value to produce json test data:
    add @io_record(enabled=True) above signature to activate logging when testing
        -> no logging will occur outside a test

    Parameters
    ----------
    enabled : bool
        - if enabled=True but unittest lib is not in scope: no logging
        - if enabled=True and unittest lib is imported in scope: active logging
        - if enabled=False: no logging, always

    Returns
    -------
    function : callable
        original function wrapped in another function recording IO

    Examples
    --------
    >>> from decoration import io_record
    >>> import unittest  # unittest must be in scope to activate logging
    >>>
    >>> @io_record(enabled=True)
    ... def my_function(a):
    ...     return a
    ...
    >>> my_function("hello")
    'hello'

    on a filesystem datastore, 'hello' is saved under the path runtime/io/my_function/{timestamp}-...:
        - in a.json as an argument named according to the function signature
        - in out.json as return value
    """

    def recorder(func):
        is_active = "unittest" in sys.modules and enabled

        def switch(*args):
            if is_active:
                ts = time.time()
                path = "io/" + func.__name__
                full_path = DatastoreLocal().runtime_path("", "", path)
                prefix = path + f"/{ts}-"
                if not os.path.exists(full_path):
                    os.makedirs(full_path)
                arg_names = inspect.getfullargspec(func).args
                for i, arg in enumerate(args):
                    # empty user & creation ids to reuse records in a development context
                    DatastoreLocal().save(prefix + arg_names[i], arg)
            output = func(*args)
            if is_active:
                DatastoreLocal().save(prefix + "out", output)
            return output

        return switch

    return recorder
