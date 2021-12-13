#/bin/bash

LINE_PREFIX="m-eth"
cd /root

# Sanity check
if [ ! -d /home/vagrant ]; then
	echo "$LINE_PREFIX: Environment sanity check failed. This script should only be run on guests."
	exit 1
fi

# Install system utilities
echo "$LINE_PREFIX: Installing system utilities..."

apt -y update
apt -y install net-tools locate

# Setup build environment
echo "$LINE_PREFIX: Setting up build environment..."

apt -y install build-essential

# Install node
echo "$LINE_PREFIX: Installing node..."

# https://github.com/nodesource/distributions/blob/master/README.md
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y nodejs
#which node || exit 1
#which npm || exit 1

# Install solhint
echo "$LINE_PREFIX: Installing solhint..."
npm install -g solhint

# Install solc
echo "$LINE_PREFIX: Installing solc..."

# From: https://github.com/ethereum/solidity/releases
SOLC_VERSION=0.8.10
pushd /usr/local/bin
wget -O solc-$SOLC_VERSION "https://github.com/ethereum/solidity/releases/download/v$SOLC_VERSION/solc-static-linux"
chmod +x solc-$SOLC_VERSION
if [ -f solc ]; then
	unlink solc
fi
ln -s solc-$SOLC_VERSION solc
popd

# Add jump to project folder upon login (for dev.sh)
echo "$LINE_PREFIX: Adding project jump..."
echo 'cd ~/project' >> /root/.profile
echo '' >> /root/.profile

# Add "hardhat" command alias
echo "$LINE_PREFIX: Adding hardhat alias..."
echo '' >> /root/.bashrc
echo 'alias hardhat="npx hardhat"' >> /root/.bashrc
echo '' >> /root/.bashrc

# Finalize install
echo "$LINE_PREFIX: finalizing installation..."
updatedb

# Success
echo "$LINE_PREFIX: Done."

exit 0
