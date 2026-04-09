# KSP Mulia Dana Sejahtera - Specification

## 1. Project Overview

- **Project Name**: KSP Mulia Dana Sejahtera
- **Type**: Website for a Savings and Loans Cooperative (Koperasi Simpan Pinjam)
- **Core Functionality**: Present company profile, services, products, and contact information for a financial cooperative
- **Target Users**: Potential members, existing members, general public seeking financial services

## 2. UI/UX Specification

### Layout Structure

- **Header**: Fixed navigation with logo and menu links
- **Hero Section**: Full-width banner with company tagline
- **Services Section**: Grid display of main services
- **About Section**: Company profile with image
- **Products Section**: Financial products information
- **Testimonials**: Member testimonials carousel
- **Contact Section**: Contact form and information
- **Footer**: Links, social media, copyright

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Design

#### Color Palette
- **Primary**: `#1B4D3E` (Deep Green - trust, growth)
- **Primary Light**: `#2D7A5F`
- **Secondary**: `#D4AF37` (Gold - prosperity)
- **Secondary Light**: `#E8C547`
- **Accent**: `#0A2E25` (Dark green)
- **Background**: `#FAF9F6` (Warm white)
- **Surface**: `#FFFFFF`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#4A4A4A`
- **Text Light**: `#FFFFFF`

#### Typography
- **Headings**: "Playfair Display", serif
- **Body**: "DM Sans", sans-serif
- **Sizes**:
  - H1: 56px / 64px line-height
  - H2: 42px / 52px line-height
  - H3: 28px / 36px line-height
  - Body: 16px / 26px line-height
  - Small: 14px / 22px line-height

#### Spacing System
- Base unit: 8px
- Section padding: 96px vertical, 24px horizontal
- Component spacing: 24px
- Card padding: 32px

#### Visual Effects
- Card shadows: `0 4px 24px rgba(27, 77, 62, 0.08)`
- Hover shadows: `0 8px 32px rgba(27, 77, 62, 0.12)`
- Border radius: 16px for cards, 8px for buttons
- Transitions: 0.3s ease

### Components

#### Navigation
- Logo (left): "KSP Mulia Dana Sejahtera" with icon
- Menu items (right): Beranda, Layanan, Tentang, Produk, Kontak
- Mobile: Hamburger menu

#### Hero Section
- Full viewport height
- Background: Gradient overlay on abstract pattern
- Main headline: "Mulia Dana Sejahtera"
- Subheadline: "Membangun Negeri, Membahagiakan Anggota"
- CTA Button: "Bergabung Sekarang"

#### Services Cards
- Icon, title, description
- Services: Simpanan, Pinjaman, Investasi, Layanan Digital
- Hover effect: lift and shadow

#### About Section
- Image (left), content (right)
- Company history and mission

#### Products Section
- Tabbed or grid layout
- Products: Simpanan Pokok, Simpanan Sukarela, Pinjaman Umum, Pinjaman Bisnis

#### Testimonials
- Member quotes with photo
- Auto-scroll carousel

#### Contact Form
- Name, email, phone, message fields
- Submit button
- Contact info sidebar

#### Footer
- Logo and description
- Quick links
- Contact information
- Social media icons

## 3. Functionality Specification

### Core Features
- Responsive navigation with mobile menu
- Smooth scroll to sections
- Interactive service cards
- Contact form (client-side validation only)
- Animated elements on scroll

### User Interactions
- Click navigation to scroll to section
- Hover effects on cards and buttons
- Mobile menu toggle
- Form validation feedback

## 4. Acceptance Criteria

- [ ] Page loads without errors
- [ ] All sections visible and properly styled
- [ ] Navigation works correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Colors match spec exactly
- [ ] Typography matches spec
- [ ] All interactive elements have hover states
- [ ] Contact form shows validation feedback
