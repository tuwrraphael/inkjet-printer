Run tests:
west build --pristine  -b native_posix
west build -t run
or in /inkjet-printer-zephyr/inkjet-printer
west twister -T tests --integration