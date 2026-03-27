#! /bin/bash

echo -e "Start running the script..."
cd ../

echo -e "Start building the app..."
if [ "$(uname -s)" = "Linux" ]; then
  wails build --clean -tags webkit2_41
else
  wails build --clean
fi

echo -e "End running the script!"
