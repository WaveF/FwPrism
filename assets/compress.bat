@ECHO OFF&MODE CON COLS=20 LINES=2
TITLE FwPrism
ECHO Compressing...
cd /d %~dp0
set path=%~d0%~p0
START/MIN/WAIT "" "%path%optipng.exe" -strip all -quiet -clobber -o7 -i0 "E:\Working\Àí²ÆÒ×\1.Source\640x1136\@2x\UnName_0@2x.png"
