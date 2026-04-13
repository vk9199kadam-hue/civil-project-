

## Real Estate Portfolio Platform — Build Plan

### Overview
A property showcase website (inspired by PropTiger) where you display all your construction projects. Visitors browse projects and see detailed unit/plot information. You manage everything via an admin dashboard.

### Pages & Features

#### 1. **Homepage (Public)**
- Hero section with search bar and your brand tagline
- Stats banner (projects completed, units sold, etc.)
- Featured projects grid with photos, location, price range, status
- Property type filter tabs: Flat/Apartment, Villa, Commercial, Land/Plot, Builder Projects
- Footer with contact info

#### 2. **All Projects Page (Public)**
- Grid/list of all projects with filters (property type, status: new launch / under construction / ready to move)
- Each card shows: project image, name, location, property type, price range, status badge

#### 3. **Project Detail Page (Public)**
- Image gallery / carousel of the project
- Project info: name, location, description, property type, status
- **Unit-level breakdown table**: For each unit/plot available for sale — unit number, size (sq.ft), BHK type (for flats), price, availability status (available/sold/booked), floor plan image
- Contact/inquiry section

#### 4. **Admin Dashboard (Protected)**
- Login page (email & password, admin-only)
- **Add/Edit Project**: Form to fill project name, location, description, type (Flat, Villa, Commercial, Land, Builder Project), status, upload photos
- **Manage Units**: Within each project, add individual units with details (unit number, size, BHK, price, status, photos)
- **View Inquiries**: See buyer inquiry submissions
- Project list with edit/delete actions

#### 5. **Database (Supabase/Lovable Cloud)**
- `projects` table: name, location, description, type, status, price_range, images
- `units` table: linked to project, unit_number, size_sqft, bhk_type, price, floor, status, images
- `inquiries` table: visitor name, phone, email, message, linked project
- Storage bucket for project & unit photos

#### 6. **Design Style**
- Dark navy hero (similar to PropTiger), clean white content sections
- Responsive design for mobile and desktop
- Professional real estate look with property cards, badges, and image galleries

