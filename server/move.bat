@echo off
cd api
mkdir lib
move routes lib\
move models lib\
move controllers lib\
move modules lib\
move data lib\
del health.js
echo Done.
