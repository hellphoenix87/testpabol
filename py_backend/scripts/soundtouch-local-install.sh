#!/usr/bin/env bash
# SoundTouch installation for development & local testing: supports Linux and macOS

SOUNDTOUCH_VER=2.3.2  # align with version in Dockerfile

# Determine OS

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PACKAGE_MANAGER='sudo apt-get install -y'
        DOWNLOAD_TOOL='wget'
elif [[ "$OSTYPE" == "darwin"* ]]; then
        PACKAGE_MANAGER='brew install'
        DOWNLOAD_TOOL='curl -O'
fi

# Download and unzip SoundTouch

$DOWNLOAD_TOOL "https://www.surina.net/soundtouch/soundtouch-${SOUNDTOUCH_VER}.tar.gz"
tar -xzf "soundtouch-${SOUNDTOUCH_VER}.tar.gz"
rm "soundtouch-${SOUNDTOUCH_VER}.tar.gz"
cd soundtouch

# Install necessary packages

$PACKAGE_MANAGER \
    autoconf \
    automake \
    libtool

./bootstrap
./configure
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo make install
elif [[ "$OSTYPE" == "darwin"* ]]; then
        make install
fi

cd ..
rm -rf soundtouch
