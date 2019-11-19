#! /usr/bin/env python2.7

# Author: byt3bl33d3r
# Created: 10 March, 2015

# Modified 19 November, 2019 by William Lucca

from scapy.all import *
from netfilterqueue import NetfilterQueue

def modify(packet):
    # Convert the raw packet to a scapy compatible string
    pkt = IP(packet.get_payload())

    # TODO
    # Modify the packet all you want here
    print(str(pkt))

    # Set the packet content to our modified version
    packet.set_payload(str(pkt))

    # Accept the packet
    packet.accept()


nfqueue = NetfilterQueue()

#1 is the iptables rule queue number, modify is the callback function
nfqueue.bind(1, modify) 
try:
    print "[*] waiting for data"
    nfqueue.run()
except KeyboardInterrupt:
    pass
