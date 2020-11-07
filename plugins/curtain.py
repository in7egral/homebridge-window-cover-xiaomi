import sys
from miio import CurtainMiot

def __main__():
    total = len(sys.argv)
    if total < 4:
        print ("Usage: %s <ip> <token> <position>" % sys.argv[0])
        return

    ip=sys.argv[1]
    token=sys.argv[2]
    curtain = CurtainMiot(ip, token)
    curtain.set_target_position(int(sys.argv[3]))

__main__()
