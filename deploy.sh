#!/bin/bash

echo "Last tag was:" $(git describe --tags --abbrev=0)
read -e -p "Tag: " ver
# sed -i -e "s/\"version\":.*/\"version\": "\"$ver\"",/g" package.json
git add -A && git commit -m "Release $ver."
npm version $ver && git tag "$ver"
git push origin master && git push --tags
# npm publish
