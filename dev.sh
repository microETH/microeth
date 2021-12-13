#/bin/bash

if [ "$1" == "destroy" ]; then
	vagrant destroy -f
	exit 0
elif [ "$1" == "halt" ]; then
	vagrant halt
	exit 0
fi

vagrant up && vagrant ssh -c 'sudo -i'

exit 0
