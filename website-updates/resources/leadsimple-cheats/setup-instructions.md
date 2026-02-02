# LeadSimple Dashboard Cheat Sheet - Netlify Setup Guide

## Quick Deploy (5 minutes)

### Step 1: Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up or log in (free account works!)
3. Click **"Add new site"** → **"Deploy manually"**
4. Drag and drop this entire `leadsimple-guide` folder onto the page
5. Wait ~30 seconds for deploy
6. You'll get a URL like `https://random-name-123.netlify.app`

### Step 2: (Optional) Custom Domain

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS instructions for your domain

---

## Viewing Quiz Submissions

All quiz submissions go directly to your Netlify dashboard!

### To view submissions:

1. Log into [app.netlify.com](https://app.netlify.com)
2. Click on your site
3. Go to **"Forms"** in the left sidebar
4. Click on **"quiz-submissions"**
5. You'll see all submissions with:
   - Name & email
   - Company & door count
   - All 5 quiz answers
   - Diagnosis status (Healthy/Attention/Critical)
   - Findings & recommendations

### To export submissions:

1. In the Forms section, click **"Download as CSV"**
2. Opens in Excel/Google Sheets

### To get email notifications:

1. Go to **Site settings** → **Forms** → **Form notifications**
2. Click **"Add notification"** → **"Email notification"**
3. Enter your email (Madeline@myprocessarchitect.com)
4. Select the "quiz-submissions" form
5. Save!

Now you'll get an email every time someone completes the quiz.

---

## Adding Your Screenshots

The pages have placeholder areas for your screenshots. Here's how to add them:

### Option 1: Drag & Drop (easiest)
1. Open any page in your browser
2. Drag your screenshot image onto the placeholder area
3. Image is saved in your browser

**Note:** This saves to the visitor's browser only. For permanent images, use Option 2.

### Option 2: Hardcode Images (permanent)

1. Put your screenshot files in the `images/` folder
2. Name them descriptively (e.g., `service-quality-overview.png`)
3. Edit the HTML file and replace the placeholder with:

```html
<div class="screenshot-container">
    <img src="../images/service-quality-overview.png" alt="Service Quality Overview">
</div>
```

### Recommended Screenshots to Add:

**Service Quality page:**
- Service Quality overview dashboard
- Processes Completed On Time chart
- Task Completion Rate chart
- First Response Time chart
- Occupancy Rate gauge

**Process Performance page:**
- Process Performance overview
- View Trends panel
- Active Processes chart
- Task Completion chart
- Processes Completed on Time chart
- Time to Complete chart

**Team Performance page:**
- Team Performance overview
- Individual team member view

**Customer Service page:**
- Customer Service overview
- First Response Time breakdown
- Support Burden chart

---

## File Structure

```
leadsimple-guide/
├── index.html          # Main landing page + quiz
├── styles.css          # All styling
├── quiz.js             # Quiz logic + Netlify submission
├── images.js           # Screenshot upload handling
├── pages/
│   ├── service-quality.html
│   ├── process-performance.html
│   ├── team-performance.html
│   └── customer-service.html
├── images/             # Put your screenshots here
└── data/               # (unused - Netlify handles data)
```

---

## Customization

### Change brand colors

Edit `styles.css` and modify these variables at the top:

```css
:root {
    --sage: #9CAF88;           /* Main sage green */
    --dark-green: #2D4739;     /* Dark green */
    --forest: #1A2F23;         /* Darkest green */
    /* ... */
}
```

### Change contact email

Search for `Madeline@myprocessarchitect.com` across all files and replace with your preferred email.

### Change quiz questions

Edit `index.html` - look for the quiz sections (`quiz-q1`, `quiz-q2`, etc.)

### Change diagnosis logic

Edit `quiz.js` - modify the `calculateDiagnosis()` function

---

## Netlify Free Tier Limits

- **100 form submissions/month** (free)
- If you need more: Netlify Pro is $19/month for 1,000 submissions

---

## Need Help?

Contact: Madeline@myprocessarchitect.com
