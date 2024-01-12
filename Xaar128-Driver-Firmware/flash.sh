openocd -f board/st_nucleo_h7a3ziq.cfg \
	-c "program build/Xaar128-Driver-Firmware.elf verify reset exit"