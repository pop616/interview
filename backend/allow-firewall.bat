@echo off
echo Adding firewall rule for port 3001...
netsh advfirewall firewall add rule name="Interview Backend" dir=in action=allow protocol=TCP localport=3001
echo.
echo Done. Try opening the app on your phone again.
pause

