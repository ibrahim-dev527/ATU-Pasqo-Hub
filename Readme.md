# 📚 ATU Study Hub — Complete Beginner Setup Guide
### Powered by Bafiku Emmanuel | Developed by Ibrahim Mohammed Lotsu (Ibratech)

---

> 🙋 **This guide assumes you know NOTHING about coding or web development.**
> Every step is explained in plain, simple English. Just follow one step at a time.

---

## 📋 TABLE OF CONTENTS

1. [What is this website?](#1-what-is-this-website)
2. [What files are included?](#2-what-files-are-included)
3. [How to open and view your website](#3-how-to-open-and-view-your-website)
4. [How to add your photos](#4-how-to-add-your-photos)
5. [How to set up Supabase (free database)](#5-how-to-set-up-supabase-free-database)
6. [How to connect Supabase to your website](#6-how-to-connect-supabase-to-your-website)
7. [How to create the database tables](#7-how-to-create-the-database-tables)
8. [How to create the file storage bucket](#8-how-to-create-the-file-storage-bucket)
9. [How authentication (login & signup) works](#9-how-authentication-login--signup-works)
10. [How to upload past questions (NO CODING)](#10-how-to-upload-past-questions-no-coding)
11. [How the Dashboard works](#11-how-the-dashboard-works)
12. [How to put your website online (deploy)](#12-how-to-put-your-website-online-deploy)
13. [How to add your Google Drive video](#13-how-to-add-your-google-drive-video)
14. [How to update WhatsApp numbers](#14-how-to-update-whatsapp-numbers)
15. [Troubleshooting common problems](#15-troubleshooting-common-problems)
16. [Quick checklist before going live](#16-quick-checklist-before-going-live)

---

## 1. What is this website?

Your website **ATU Study Hub** does two things:

| Purpose | What it does |
|---|---|
| 📚 **Past Questions Platform** | Students can search, filter and download past exam PDFs |
| 🗳️ **Campaign Website** | Shows Bafiku's mission, vision, about page, and lets students join the campaign |

**The website has 12 pages:**
- `index.html` → Homepage (with the 3-second loader)
- `faculties.html` → All ATU faculties
- `departments.html` → All ATU departments
- `past-questions.html` → Search and download past questions
- `about.html` → About Bafiku
- `mission.html` → Campaign mission
- `vision.html` → Campaign vision
- `help.html` → Help center and FAQs
- `contact.html` → Contact forms (sends to WhatsApp)
- `login.html` → Student login
- `signup.html` → Student registration
- `dashboard.html` → Admin panel to upload PDFs

---

## 2. What files are included?

When you open the project folder, you will see this structure:

```
atu-study-hub/
│
├── 📄 index.html          ← Homepage
├── 📄 faculties.html      ← Faculties page
├── 📄 departments.html    ← Departments page
├── 📄 past-questions.html ← Past Questions page
├── 📄 about.html          ← About Bafiku
├── 📄 mission.html        ← Mission page
├── 📄 vision.html         ← Vision page
├── 📄 help.html           ← Help center
├── 📄 contact.html        ← Contact page
├── 📄 login.html          ← Login page
├── 📄 signup.html         ← Signup page
├── 📄 dashboard.html      ← Admin dashboard
│
├── 📁 images/             ← PUT YOUR PHOTOS HERE
│   ├── bafiku.png         ← Your photo (REQUIRED)
│   └── developer.png      ← Developer photo (optional)
│
└── 📁 pdfs/               ← PUT YOUR PDF FILES HERE (optional)
    └── example.pdf        ← Example PDF
```

---

## 3. How to open and view your website

You don't need any special software to open HTML files. Here's how:

### Option A — Just double-click (Quickest way to preview)
1. Open your file manager on your computer
2. Navigate to the `atu-study-hub` folder
3. Double-click on `index.html`
4. It will open in your browser (Chrome, Firefox, etc.)
5. You can now see your website!

> ⚠️ **Note:** When you open HTML files this way, the Login and Upload features won't work yet — those need Supabase (explained below). But you can see all the design and pages perfectly.

### Option B — Use VS Code (Recommended for editing)
1. Download **VS Code** for free: https://code.visualstudio.com
2. Open VS Code
3. Click **File → Open Folder**
4. Select your `atu-study-hub` folder
5. Install the extension called **"Live Server"** (search for it in the Extensions tab on the left)
6. Right-click on `index.html` → Click **"Open with Live Server"**
7. Your website opens in the browser and updates instantly when you make changes!

---

## 4. How to add your photos

The website needs **two photos**:

### Photo 1: Bafiku's Photo
- **File name must be exactly:** `bafiku.png`
- **Where to put it:** Inside the `images` folder
- **Size recommendation:** At least 400×500 pixels, passport-style or portrait photo
- **Steps:**
  1. Find your photo on your phone or computer
  2. Rename the photo file to `bafiku.png` (make sure it ends in `.png`)
  3. Copy/paste it into the `images` folder inside `atu-study-hub`
  4. Done! Refresh your browser and the photo will appear everywhere

> 💡 If your photo is `.jpg` instead of `.png`, you can either:
> - Rename it to `bafiku.png` anyway (it usually still works), OR
> - Convert it free at https://cloudconvert.com

### Photo 2: Developer Photo (Optional)
- **File name must be exactly:** `developer.png`
- **Where to put it:** Inside the `images` folder
- This is the small circular photo of Ibrahim (Ibratech) in the footer

---

## 5. How to set up Supabase (free database)

> 🤔 **What is Supabase?**
> Supabase is a FREE online service that stores your data (like student accounts and past question information). Think of it like a Google Sheet that your website can talk to — but more powerful.

### Step 1 — Create your free Supabase account
1. Open your browser and go to: **https://supabase.com**
2. Click the green **"Start your project"** button
3. Click **"Sign up"**
4. You can sign up with your **GitHub account** (recommended) or email
   - If you don't have GitHub, create a free account first at https://github.com
5. Follow the prompts to complete signup

### Step 2 — Create a new project
1. After signing in, you'll see the Supabase dashboard
2. Click the **"New Project"** button
3. Fill in these details:
   - **Organization:** This is auto-created with your name — leave it
   - **Project name:** Type `atu-study-hub` (or any name you like)
   - **Database password:** Create a strong password and **SAVE IT SOMEWHERE** (you'll need it later)
   - **Region:** Choose **"West EU (Ireland)"** or the closest region to Ghana
4. Click **"Create new project"**
5. ⏳ Wait about 1–2 minutes while Supabase sets up your project

### Step 3 — Find your API keys
Once your project is ready:
1. In the left sidebar, click **"Project Settings"** (the gear icon ⚙️ at the bottom)
2. Click **"API"** in the settings menu
3. You will see two important values — **copy both of them:**

| What it's called | What it looks like | What to do |
|---|---|---|
| **Project URL** | `https://abcdefgh.supabase.co` | Copy this exactly |
| **anon / public key** | A long string starting with `eyJ...` | Copy this exactly |

> 🚨 **IMPORTANT:** Never share your `service_role` key with anyone. Only use the `anon` (public) key in your website files.

---

## 6. How to connect Supabase to your website

Now you need to paste your Supabase URL and key into **3 files**:
- `login.html`
- `signup.html`
- `dashboard.html`

### How to edit a file:
1. Right-click on the file → Open with **Notepad** (Windows) or **TextEdit** (Mac)
   - Or better: use **VS Code** (recommended)
2. Press `Ctrl+F` (Windows) or `Cmd+F` (Mac) to search
3. Search for: `YOUR_SUPABASE_URL`
4. Replace it with your actual Supabase URL

### Exactly what to change in each file:

Open `login.html`, `signup.html`, AND `dashboard.html` — each has these two lines near the bottom in the `<script>` section:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Change them to look like this (using your real values):

```javascript
const SUPABASE_URL = 'https://abcdefghijklmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

> ✅ Make sure you keep the **single quotes** `' '` around each value!
> ✅ Do this in all **3 files** (login.html, signup.html, dashboard.html)
> ✅ Save each file after editing (Ctrl+S)

---

## 7. How to create the database tables

> 🤔 **What is a table?**
> A table is like a spreadsheet inside your Supabase database. Each row is a record (like a student or a past question).

You need to create **2 tables**:

### Table 1: `users` table (stores student profiles)

1. Go to your Supabase project dashboard
2. In the left sidebar, click **"Table Editor"**
3. Click **"Create a new table"**
4. Set **Table name** to: `users`
5. Turn OFF "Enable Row Level Security (RLS)" for now (you can enable it later)
6. Add these columns (click "+ Add Column" for each):

| Column Name | Type | Default Value | Notes |
|---|---|---|---|
| `id` | `uuid` | — | This is auto-created as the primary key |
| `email` | `text` | — | Student's email |
| `name` | `text` | — | Student's full name |
| `phone` | `text` | — | Student's phone number |
| `faculty` | `text` | — | Their faculty |
| `level` | `text` | — | Their level (100, 200, etc.) |
| `created_at` | `timestamptz` | `now()` | When they signed up |

7. Click **"Save"**

### Table 2: `past_questions` table (stores info about uploaded PDFs)

1. Click **"Create a new table"** again
2. Set **Table name** to: `past_questions`
3. Turn OFF "Enable Row Level Security (RLS)" for now
4. Add these columns:

| Column Name | Type | Default Value | Notes |
|---|---|---|---|
| `id` | `int8` | — | Auto-increment primary key |
| `title` | `text` | — | Name of the course/paper |
| `faculty` | `text` | — | Which faculty |
| `department` | `text` | — | Which department |
| `level` | `text` | — | Level 100, HND 1, etc. |
| `year` | `int4` | — | Year of the exam |
| `file_url` | `text` | — | Link to the PDF file |
| `downloads` | `int4` | `0` | Download count |
| `created_at` | `timestamptz` | `now()` | Upload date |

5. Click **"Save"**

> ✅ You now have 2 tables ready to use!

---

## 8. How to create the file storage bucket

> 🤔 **What is a storage bucket?**
> It's like a folder in the cloud where your PDF files will be stored when you upload them.

### Steps:
1. In your Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. In the **Bucket name** field, type exactly: `past-questions`
   - ⚠️ Spelling must be exact — use a hyphen not a space
4. Turn ON the toggle that says **"Public bucket"**
   - This means students can download files without logging in
5. Click **"Create bucket"**

### Allow uploads (set bucket policy):
1. Click on your new `past-questions` bucket
2. Click **"Policies"**
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Set:
   - **Policy name:** `allow_uploads`
   - **Allowed operation:** Check ✅ INSERT, SELECT
   - **Target roles:** `anon`, `authenticated`
6. Click **"Review"** → **"Save policy"**

> ✅ Your storage is now ready! PDFs you upload will be stored here automatically.

---

## 9. How authentication (login & signup) works

### How signup works:
1. A new student visits `signup.html`
2. They fill in their name, email, phone, faculty, level, and password
3. They click **"Create Free Account"**
4. Behind the scenes:
   - Supabase creates a secure account with their email and password
   - Their details (name, phone, faculty, level) are saved to your `users` table
   - Supabase sends a **confirmation email** to their inbox
5. They click the link in the email to verify
6. They can now log in!

### How login works:
1. Student visits `login.html`
2. Enters email and password
3. Clicks **"Sign In"**
4. Supabase checks if the email and password are correct
5. If correct → they are taken to the dashboard
6. If wrong → they see an error message

### How to enable email confirmation (optional but recommended):
1. In Supabase → **Authentication** → **Providers**
2. Click **Email**
3. Enable **"Confirm email"** toggle
4. Students will get a verification email when they sign up

### How to view all registered students:
1. In Supabase → **Authentication** → **Users**
2. You'll see a list of everyone who has signed up

---

## 10. How to upload past questions (NO CODING)

> 🎉 **This is the most important section for Bafiku!**
> Once everything is set up, you can upload past questions in 2 ways — **neither requires any coding**.

---

### METHOD 1: Upload through the Dashboard (Recommended)

This is the easiest way. It's just like filling a form.

**Steps:**
1. Open your browser and go to your website's `dashboard.html` page
   - Example: `https://your-website.netlify.app/dashboard.html`
2. Log in with your admin email and password
3. You'll see the **Upload Past Question** form on the left side
4. Fill in the form:
   - **Course/Paper Title** → e.g. "Engineering Mathematics I – Final Exam"
   - **Faculty** → Select from the dropdown (e.g. "Engineering")
   - **Department** → e.g. "Civil Engineering" (optional)
   - **Level** → Select from dropdown (e.g. "Level 100")
   - **Year** → Select the year (e.g. "2023")
5. Click the **file upload area** and choose your PDF from your computer
   - OR drag and drop the PDF file onto the upload area
6. Click the red **"Upload Past Question"** button
7. Wait for the progress bar to complete
8. You'll see a ✅ success message
9. The past question is now LIVE on the website immediately!

> 💡 **Tips for uploading:**
> - The PDF file must be under **10MB** in size
> - Use clear file names like `eng_math_final_2023.pdf`
> - You can upload multiple past questions one after another

---

### METHOD 2: Upload directly through Supabase (Alternative)

If you want to upload without going through the website:

**Step A — Upload the PDF file:**
1. Go to your Supabase project → **Storage**
2. Click on the `past-questions` bucket
3. Click **"Upload files"**
4. Select your PDF
5. Once uploaded, click on the file → **"Copy URL"** → save this URL

**Step B — Add the record to the database:**
1. Go to **Table Editor** → click `past_questions` table
2. Click **"Insert row"**
3. Fill in all the columns:
   - `title`: Name of the past question
   - `faculty`: e.g. Engineering
   - `department`: e.g. Civil Engineering
   - `level`: e.g. Level 100
   - `year`: e.g. 2023
   - `file_url`: Paste the URL you copied in Step A
4. Click **"Save"**
5. Done! The past question now appears in the database.

---

## 11. How the Dashboard works

The dashboard (`dashboard.html`) is your **admin control panel**. Here's everything it does:

### What you can see on the Dashboard:

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (Left)          │  MAIN CONTENT (Right)    │
│                          │                          │
│  📊 Dashboard            │  4 Stats cards at top:  │
│  📚 Past Questions       │  • Total Past Questions  │
│  ⬆️  Upload PDF          │  • Registered Students   │
│  💬 WhatsApp             │  • Total Downloads       │
│  🏠 Homepage             │  • Faculties Covered     │
│                          │                          │
│  [Your Name]             │  Upload Form (left)      │
│  [Sign Out]              │  Recent Uploads (right)  │
└─────────────────────────────────────────────────────┘
```

### Dashboard features explained:

| Feature | What it does |
|---|---|
| **Stats Cards** | Shows quick numbers (students, downloads, etc.) |
| **Upload Form** | Upload new PDFs with all their details |
| **File Drop Zone** | Drag & drop PDFs or click to browse |
| **Progress Bar** | Shows upload progress in real time |
| **Recent Uploads** | List of last files uploaded |
| **Quick Actions** | Shortcuts to important pages |
| **Setup Guide** | Mini reminder of Supabase setup steps |
| **Sign Out** | Logs you out securely |

### How to access the Dashboard:
- You MUST be logged in to use the dashboard
- If you're not logged in, it will redirect you to `login.html`
- Only use your personal admin email/password to log in

---

## 12. How to put your website online (deploy)

> 🤔 **What is deployment?**
> Right now your website only exists on your computer. To put it online so everyone can visit it, you need to "deploy" it. The easiest free option is **Netlify**.

### Deploy with Netlify (100% Free, No Credit Card)

**Step 1 — Create a Netlify account:**
1. Go to **https://netlify.com**
2. Click **"Sign up"**
3. Sign up with your GitHub account (or email)

**Step 2 — Deploy your website:**
1. After signing in, you'll see the Netlify dashboard
2. Find the section that says **"Deploy manually"** or **"Want to deploy a new site without connecting to Git?"**
3. You'll see a big drag & drop area that says **"Drag and drop your site folder here"**
4. Open your file manager, find your `atu-study-hub` folder
5. **Drag the entire `atu-study-hub` folder** and drop it into that Netlify area
6. Wait about 30–60 seconds
7. Netlify will give you a random URL like: `https://amazing-name-123.netlify.app`
8. Open that URL in your browser — **your website is now live!**

**Step 3 — Give it a better URL (optional):**
1. In Netlify, click on your site
2. Go to **"Site settings"** → **"Domain management"**
3. Click **"Options"** → **"Edit site name"**
4. Change it to something like `atu-study-hub` → your URL becomes `https://atu-study-hub.netlify.app`

**Step 4 — Update your website in the future:**
1. Make your changes to the HTML files on your computer
2. Drag the whole folder onto Netlify again
3. It automatically updates your live site!

> 💡 **Alternative free hosting options:**
> - **GitHub Pages** — https://pages.github.com (free, good for static sites)
> - **Vercel** — https://vercel.com (free, very fast)

---

## 13. How to add your Google Drive video

The homepage has a video section for your campaign video. Here's how to add it:

**Step 1 — Upload your video to Google Drive:**
1. Go to **https://drive.google.com**
2. Click **"+ New"** → **"File upload"**
3. Select your campaign video (MP4, MOV, etc.)
4. Wait for it to finish uploading

**Step 2 — Get the shareable link:**
1. Right-click on your uploaded video
2. Click **"Share"**
3. Click **"Change to anyone with the link"**
4. Click **"Copy link"**
5. Your link will look like this:
   `https://drive.google.com/file/d/`**`1ABC123xyz456DEF`**`/view?usp=sharing`
6. The part in bold is your **FILE ID** — copy just that part

**Step 3 — Add it to your website:**
1. Open `index.html` in Notepad or VS Code
2. Press `Ctrl+F` and search for: `FILE_ID`
3. You'll find this line:
   ```html
   <iframe src="https://drive.google.com/file/d/FILE_ID/preview"
   ```
4. Replace `FILE_ID` with your actual ID, e.g.:
   ```html
   <iframe src="https://drive.google.com/file/d/1ABC123xyz456DEF/preview"
   ```
5. Save the file

> ✅ Your video will now appear on the homepage!

---

## 14. How to update WhatsApp numbers

Your website uses two WhatsApp numbers throughout. If you need to change them:

**Current numbers in the code:**
- `https://wa.me/233536801965` (primary)
- `https://wa.me/233544823484` (alternative)

**How to change them:**
1. Open each HTML file in VS Code or Notepad
2. Press `Ctrl+H` (Find and Replace)
3. In **"Find"** type: `233536801965`
4. In **"Replace"** type your new number (with country code, no spaces or +)
   - Example: Ghana number `0201234567` becomes `233201234567`
5. Click **"Replace All"**
6. Repeat for the second number: `233544823484`
7. Save the file

---

## 15. Troubleshooting common problems

### ❌ "My photo is not showing"
- Make sure the file is named EXACTLY `bafiku.png` (lowercase, no spaces)
- Make sure it's inside the `images` folder
- Try refreshing the page (Ctrl+Shift+R)

### ❌ "Login is not working"
- Check that you replaced `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in `login.html`
- Make sure the values have single quotes around them: `'https://...'`
- Check that your Supabase project is active (not paused)

### ❌ "Signup says email already exists"
- The student already has an account with that email
- Tell them to use the Login page instead

### ❌ "Upload is failing"
- Check your internet connection
- Make sure the PDF is under 10MB
- Check that you created the `past-questions` storage bucket in Supabase
- Check that you set the bucket to **Public**
- Make sure you correctly replaced the Supabase URL and key in `dashboard.html`

### ❌ "The website looks broken on mobile"
- This is a browser cache issue — try opening in an incognito/private window
- Or clear your browser cache (Ctrl+Shift+Delete)

### ❌ "Supabase project is paused"
- Free Supabase projects pause after 1 week of inactivity
- Go to https://supabase.com → click your project → click **"Restore project"**
- This is free and takes 1 minute

### ❌ "I can't find my Supabase API keys"
1. Go to https://supabase.com and log in
2. Click your project name
3. Click the ⚙️ gear icon (Settings) in the left sidebar
4. Click "API"
5. You'll see your URL and keys there

---

## 16. Quick checklist before going live

Go through this list before sharing your website with students:

### ✅ Photos
- [ ] Added `bafiku.png` to the `images` folder
- [ ] Added `developer.png` to the `images` folder (optional)

### ✅ Supabase Setup
- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied Project URL and Anon Key
- [ ] Replaced `YOUR_SUPABASE_URL` in `login.html`
- [ ] Replaced `YOUR_SUPABASE_ANON_KEY` in `login.html`
- [ ] Replaced `YOUR_SUPABASE_URL` in `signup.html`
- [ ] Replaced `YOUR_SUPABASE_ANON_KEY` in `signup.html`
- [ ] Replaced `YOUR_SUPABASE_URL` in `dashboard.html`
- [ ] Replaced `YOUR_SUPABASE_ANON_KEY` in `dashboard.html`

### ✅ Supabase Database
- [ ] Created `users` table with all columns
- [ ] Created `past_questions` table with all columns

### ✅ Supabase Storage
- [ ] Created `past-questions` bucket (with hyphen)
- [ ] Set bucket to **Public**
- [ ] Set bucket policy to allow uploads

### ✅ Content
- [ ] Added Google Drive video ID to `index.html`
- [ ] Verified WhatsApp numbers are correct
- [ ] Tested the contact form (sends to WhatsApp)
- [ ] Uploaded at least a few sample past questions

### ✅ Deployment
- [ ] Uploaded folder to Netlify (or other host)
- [ ] Tested the live URL on mobile and desktop
- [ ] Shared the URL with students!

---

## 🎉 You're done!

Once you've completed all the steps above, your website is ready to serve ATU students. Here's a quick summary of what you can do from this point:

| Task | How to do it |
|---|---|
| Upload new past questions | Login → Dashboard → Fill form → Upload |
| See registered students | Supabase → Authentication → Users |
| See uploaded files | Supabase → Storage → past-questions bucket |
| Update website content | Edit HTML files → Re-upload to Netlify |
| Change photos | Replace files in `images` folder → Re-upload |
| Add new past questions to search | Upload via Dashboard (auto-appears) |

---

## 📞 Support

If you're stuck on any step, contact the developer directly:

- **Developer:** Ibrahim Mohammed Lotsu (Ibratech)
- **WhatsApp:** *(Contact via campaign)*
- **Campaign Contact:** Bafiku Emmanuel — 053 680 1965 or 054 482 3484

---

*Built with ❤️ for ATU Students by Ibratech | ATU Study Hub © 2026*