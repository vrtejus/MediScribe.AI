#Run Firebase Emulators

> Make sure you have installed python3.11. And install virtualenv if you don't already have it, too!

`cd functions`

`virtualenv -p `which python3.11` ./venv`

`. "./venv/bin/activate"`

`pip3 install -r requirements.txt`

`firebase emulators:start`
