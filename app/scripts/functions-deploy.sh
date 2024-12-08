#!/bin/bash
set -euo pipefail

# generate the commit hash with functions' file context: imported in functions/src/utils/utils.js file
# and build GCF functions
# -> output file (functions/src/.env) must be ignored in .gitignore and whitelisted in .gcloudignore
npm run build:functions

# enter interactive mode and answer "N" to:
# "Would you like to proceed with the deletion of functions not found in source code?"
# -> see background about this trick in https://github.com/firebase/firebase-tools/pull/999
echo \"N\n\" | firebase deploy --only functions --interactive
