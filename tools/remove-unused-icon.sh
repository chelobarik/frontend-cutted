#/bin/sh
echo "cut a head"
grep -v \<glyph ionicons.svg | head -n -1 > ionicons-cut.svg
echo "find a used icons"
cat ../js/*.js | grep -Po '\("Icon",{attrs:{type:"\K[^"]*' | sort -u | awk '{print "\""$1"\""}' >used-icons.txt
echo "add used icons to ionicons-cut.svg"
grep -f used-icons.txt ionicons.svg  >>ionicons-cut.svg
echo "add tail"
tail -n 1 ionicons.svg >> ionicons-cut.svg
