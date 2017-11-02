@ECHO OFF&MODE CON COLS=20 LINES=2
TITLE FwPrism
ECHO Downloading...
cd /d %~dp0
START/MIN/WAIT "" wget.exe  --no-check-certificate -i filelist.txt -O "C:\\Users\\Admin\\Pictures\\123.fw.png"
"D:\\Program Files (x86)\\Adobe\\Adobe Fireworks CS6\\Fireworks.exe" "D:\\Program Files (x86)\\Adobe\\Adobe Fireworks CS6\\Configuration\\Command Panels\\FwPrism\\uac.jsf"
