#!/usr/bin/env python
"""
Delete older Cloud Functions to remain below quota limits
(https://cloud.google.com/functions/quotas)
"""

import doctest
import re
from os import environ
import git
from google.cloud import functions_v1, functions_v2


def can_delete(name: str, commits_tokeep: set[str]) -> bool:
    """Can a function be deleted

    >>> can_delete("donotdeleteme", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("addUser", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("ext-firestore-send-email-processQueue", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("Rf5a91a2me", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("rf5a91a2_me", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("Rf5a91a2_me", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("R2c3eac7_me", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("R2c3eac7_me", {"f5a91a2"})
    True
    >>> can_delete("Ra1b2c3d_me", {"f5a91a2", "2c3eac7"})
    True
    >>> can_delete("Rz9x8k70_me", {"f5a91a2", "2c3eac7"})
    True
    >>> can_delete("Rz9x8k7_me", {"f5a91a2", "2c3eac7"})
    False
    >>> can_delete("Rb01129b_saveShots", {"f5a91a2", "2c3eac7"})
    True
    >>> can_delete("Rb01129b_saveShots", {"f5a91a2", "2c3eac7", "b01129b"})
    False
    """

    # Immutable functions starts with: an "R", git short hash and "_"
    hash = re.search("^R([a-z0-9]{7})_", name)

    # Keep function without a commit hash
    if not hash:
        return False
    # Keep function with a whitelisted commit hash
    elif any(c for c in commits_tokeep if hash.groups(0)[0] == c):
        return False
    return True


if __name__ == "__main__":

    # Run unittest before the real program
    doctest.testmod()

    print("[INFO] Commits to keep")
    repo = git.Repo()
    commits_tokeep = set()
    for refs in repo.remote().refs:
        print(f"- {refs.name}")
        max_commits = 10 if refs.name == "origin/main" else 1
        commits = [
            c.hexsha[:7]
            for c in repo.iter_commits(rev=refs.name, max_count=max_commits)
        ]
        print(" | ".join(commits))
        commits_tokeep.update(commits)

    print("[INFO] Parsing functions v1")
    client = functions_v1.CloudFunctionsServiceClient()
    funcs = client.list_functions(
        request=functions_v1.ListFunctionsRequest(
            parent=f"projects/{environ['GOOGLE_CLOUD_PROJECT']}/locations/-",
        ),
    )
    for func in funcs:
        name = func.name.split("/")[-1]
        if not can_delete(name, commits_tokeep):
            continue
        print(f"[INFO]   Deleting: {func.name}")
        operation = client.delete_function(
            request=functions_v1.DeleteFunctionRequest(
                name=func.name,
            ),
        )
        operation.result()
    print()

    print("[INFO] Parsing functions v2")
    client = functions_v2.FunctionServiceClient()
    funcs = client.list_functions(
        request=functions_v2.ListFunctionsRequest(
            parent=f"projects/{environ['GOOGLE_CLOUD_PROJECT']}/locations/-",
        ),
    )
    for func in funcs:
        name = func.name.split("/")[-1]
        if not can_delete(name, commits_tokeep):
            continue
        print(f"[INFO]   Deleting: {func.name}")
        operation = client.delete_function(
            request=functions_v2.DeleteFunctionRequest(
                name=func.name,
            ),
        )
        operation.result()
    print()
