# Quick Start Guide - Project Detail Page

## How to Use

### 1. Navigate to the Page

From the admin projects list (`/admin/projects`):
1. Click the **"Detail"** button on any project row
2. You'll be redirected to `/admin/projects/[id]` where `[id]` is the project ID

### 2. View Project Information

The page displays 4 tabs:

#### 📋 Overview Tab
- **Basic Info**: Project name, number, type
- **Client Info**: Name, email, phone
- **Status**: Current status, priority, progress
- **Dates**: Start date, deadline, completion
- **Financials**: Total price, amount paid, currency

#### 🔧 Technical Tab (NEW)
- **URLs**: Production, Staging, GitHub repository
- **Hosting**: Provider, domain, registrar
- **Credentials**: Secure notes for login info

#### 📁 Files Tab
- Placeholder for future file uploads

#### 📅 Timeline Tab
- Placeholder for project history
- Shows creation and update dates

### 3. Edit Fields

1. Click into any input field
2. Make your changes
3. Click **"Uložit změny"** (Save Changes) button
4. Wait for success confirmation

### 4. Field Descriptions

#### Basic Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Project Name | Text | Yes | Display name of the project |
| Project Number | Text | No | Auto-generated (read-only) |
| Project Type | Select | No | Web, E-shop, Landing page, App, Other |

#### Client Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Client Name | Text | Yes | Full name or company name |
| Email | Email | Yes | Contact email |
| Phone | Tel | No | Phone number |

#### Status & Priority
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Status | Select | Yes | Unpaid, In Progress, Delivered, etc. |
| Priority | Select | Yes | High, Medium, Low |
| Progress | Number | No | 0-100% completion |

#### Dates
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Start Date | Date | No | When project began |
| Deadline | Date | Yes | Due date |
| Completed At | Date | No | When finished |

#### Financials
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Total Price | Number | No | Full project cost |
| Paid Amount | Number | No | Amount received so far |
| Currency | Select | No | CZK, EUR, USD |

#### Technical Info (NEW)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Production URL | URL | No | Live website address |
| Staging URL | URL | No | Test environment address |
| GitHub Repo | URL | No | Source code repository |
| Hosting Provider | Select | No | Vercel, Netlify, Custom, Other |
| Domain Name | Text | No | example.com |
| Domain Registrar | Text | No | GoDaddy, Wedos, etc. |
| Hosting Info | Textarea | No | Login credentials, notes |

### 5. Validation Rules

The form validates:
- ✅ Required fields must be filled
- ✅ Progress must be between 0-100
- ✅ Prices must be positive numbers
- ✅ Paid amount cannot exceed total price
- ✅ Email must be valid format
- ✅ URLs must be valid format

### 6. Saving Changes

When you click "Uložit změny":
1. Form validates all fields
2. If valid: Saves to Firestore
3. Shows success message (green)
4. Message auto-dismisses after 3 seconds

If validation fails:
1. Shows error message (red)
2. Indicates which field needs correction
3. No data is saved

### 7. Navigation

**Back to Projects List:**
- Click the ← (back arrow) button in the header
- Or use browser back button

**Direct Access:**
- You can bookmark `/admin/projects/[id]` URLs
- Direct links work for sharing

## Tips & Tricks

### 💡 Quick Tips
1. **Save frequently** - Changes aren't auto-saved
2. **Use Tab key** - Navigate between fields quickly
3. **Required fields** - Look for asterisk (*) in labels
4. **URL links** - Click the link icon next to URLs to open in new tab
5. **Progress bar** - Updates in real-time as you type

### 🎨 Visual Indicators
- **Green badge** = Delivered/Complete
- **Blue badge** = In Progress
- **Red badge** = Unpaid/Issues
- **Progress bars** = Show completion percentage

### 🔒 Security
- **Hosting Info** field is for sensitive data (passwords, API keys)
- Stored securely in Firestore
- Only admins can view

### ⚡ Performance
- Page loads instantly from Firestore
- Saves are asynchronous (< 1 second)
- No page refresh needed

## Common Tasks

### Task: Update Project Status
1. Go to Overview tab
2. Find "Status & Priority" card
3. Click "Stav projektu" dropdown
4. Select new status
5. Click "Uložit změny"

### Task: Add Technical Info
1. Go to Technical tab
2. Fill in URLs (production, staging, GitHub)
3. Select hosting provider
4. Add domain information
5. Enter any credentials in "Hosting Info"
6. Click "Uložit změny"

### Task: Track Progress
1. Go to Overview tab
2. Find "Status & Priority" card
3. Update "Progress" number (0-100)
4. Visual bar updates automatically
5. Click "Uložit změny"

### Task: Update Financials
1. Go to Overview tab
2. Find "Financials" card
3. Update total price and/or paid amount
4. Payment progress bar updates
5. Click "Uložit změny"

## Troubleshooting

### ❌ "Projekt nebyl nalezen"
- **Cause**: Invalid project ID in URL
- **Solution**: Go back to projects list and click Detail again

### ❌ Validation Error Messages
- **Cause**: Missing required field or invalid data
- **Solution**: Check the error message, fix the field, try again

### ❌ Save Failed
- **Cause**: Network issue or Firebase error
- **Solution**: Check internet connection, refresh page, try again

### ❌ Page Won't Load
- **Cause**: Not authenticated
- **Solution**: Log in at `/admin/login` first

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Next field |
| Shift+Tab | Previous field |
| Ctrl+S / ⌘+S | Save (may not work in all browsers) |
| Esc | Cancel/blur current field |

## Browser Support

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Opera 76+

## Mobile/Tablet

The page is responsive and works on:
- 📱 Mobile phones (portrait/landscape)
- 📱 Tablets (iPad, Android tablets)
- 💻 Desktop (all screen sizes)

## Need Help?

1. Check `/app/admin/projects/[id]/README.md` for technical details
2. See `IMPLEMENTATION_SUMMARY.md` for complete feature list
3. Contact your development team

---

**Last Updated:** 2025-11-20
**Version:** 1.0
