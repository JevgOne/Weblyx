# Project Detail/Edit Page

## Location
`/Users/zen/weblyx/app/admin/projects/[id]/page.tsx`

## Overview
Comprehensive project detail and edit page for the Weblyx admin panel. This page allows administrators to view and edit all project information including basic details, client information, technical details, and financial data.

## Features

### 1. **Dynamic Routing**
- Uses Next.js 14 dynamic routes with `[id]` parameter
- Fetches project data from Firestore based on URL parameter
- Handles loading and error states

### 2. **Tabbed Interface**
The page is organized into 4 main tabs:

#### Overview Tab
- **Basic Information**: Project name, number, type
- **Client Information**: Name, email, phone
- **Status & Priority**: Current status, priority level, progress tracking
- **Dates**: Start date, deadline, completion date
- **Financials**: Total price, amount paid, currency, payment progress

#### Technical Tab
- **URLs**: Production URL, Staging URL, GitHub repository
- **Hosting**: Provider selection (Vercel, Netlify, Custom, Other)
- **Domain**: Domain name and registrar information
- **Technical Notes**: Secure storage for credentials and hosting information

#### Files Tab
- Placeholder for future file management implementation
- Will support documents, logos, wireframes, contracts

#### Timeline Tab
- Placeholder for project history and milestones
- Shows creation and last update timestamps

### 3. **Status Overview Cards**
Four summary cards at the top showing:
- Project status with color-coded badges
- Visual progress indicator (0-100%)
- Total project price
- Amount paid with percentage

### 4. **Form Validation**
Comprehensive validation for:
- Required fields (name, client name, client email, deadline)
- Numeric ranges (progress: 0-100, prices: positive numbers)
- Logical constraints (paid amount ≤ total price)

### 5. **Real-time Updates**
- Auto-save functionality with loading state
- Success/error message notifications
- Automatic message dismissal after 3 seconds

### 6. **Data Management**
- Fetches data from Firestore on load
- Updates Firestore on save
- Tracks `updatedAt` timestamp automatically

## Technical Details

### Type Definitions
All types are defined in `/Users/zen/weblyx/types/project.ts`:

```typescript
export interface Project {
  // Basic info
  id: string;
  projectNumber: string;
  name: string;

  // Client
  clientName: string;
  clientEmail: string;
  clientPhone?: string;

  // Project details
  projectType: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;

  // Dates
  startDate?: string;
  deadline: string;
  completedAt?: string;

  // Financials
  priceTotal: number;
  pricePaid: number;
  currency: string;

  // Technical (NEW)
  productionUrl?: string;
  stagingUrl?: string;
  githubRepo?: string;
  hostingProvider?: HostingProvider;
  hostingInfo?: string;
  domainName?: string;
  domainRegistrar?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` - Layout
- `Input` - Text inputs
- `Textarea` - Multi-line text (hosting notes)
- `Select` - Dropdowns for status, priority, type, etc.
- `Button` - Actions and navigation
- `Badge` - Status indicators
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tabbed interface
- `Label` - Form labels

### Icons (lucide-react)
- `ArrowLeft` - Back navigation
- `Save`, `Clock` - Save actions
- `AlertCircle`, `CheckCircle2` - Messages
- `Calendar` - Dates
- `DollarSign` - Financials
- `User` - Client info
- `Globe` - URLs
- `Github` - Repository link
- `Server` - Hosting

## Navigation

### From Projects List
The main projects page (`/admin/projects/page.tsx`) has been updated to link to detail pages:

```typescript
<Button onClick={() => router.push(`/admin/projects/${project.id}`)}>
  Detail
</Button>
```

### Back Navigation
Header includes back button to return to projects list:

```typescript
<Button onClick={() => router.push("/admin/projects")}>
  <ArrowLeft />
</Button>
```

## Security Considerations

1. **Authentication**: Checks for authenticated user via Firebase Auth
2. **Sensitive Data**: Hosting credentials stored securely in Firestore
3. **Validation**: Server-side validation recommended for production
4. **Access Control**: Should add role-based permissions in production

## Future Enhancements

1. **File Management**
   - Upload/download project files
   - Document versioning
   - Image gallery

2. **Timeline/History**
   - Activity log
   - Change tracking
   - Comments and notes

3. **Collaboration**
   - Team member assignments
   - Client portal access
   - Real-time collaboration

4. **Automation**
   - Auto-generate project numbers
   - Email notifications
   - Status change triggers

## Testing

To test the page:

1. Navigate to `/admin/projects`
2. Click "Detail" on any project
3. Edit any field
4. Click "Uložit změny" (Save Changes)
5. Verify success message
6. Refresh page to confirm changes persisted

## Dependencies

New dependencies installed:
- `@radix-ui/react-tabs` - Tabbed interface component

## Files Created/Modified

### Created
1. `/Users/zen/weblyx/types/project.ts` - TypeScript type definitions
2. `/Users/zen/weblyx/components/ui/tabs.tsx` - Tabs component
3. `/Users/zen/weblyx/app/admin/projects/[id]/page.tsx` - Main detail page

### Modified
1. `/Users/zen/weblyx/app/admin/projects/page.tsx` - Added navigation to detail page

## Notes

- The page uses Czech language for UI text (as per project convention)
- Mock data is used in development mode (via mock-firebase.ts)
- All technical fields are optional to maintain backwards compatibility
- Progress bar shows visual representation of both project completion and payment status
