# Sim2Real

Sim2Real is a full-stack, end-to-end competition management platform designed to bridge the gap between simulation and reality. Built with a high-performance **Django** backend and a dynamic **React 19 / Three.js** frontend, the platform delivers an immersive 3D landing experience alongside powerful participant management, payment verification, submission grading, and staff administration portals.

---

## Tech Stack

### Frontend (Landing Page & 3D Interactive UI)
* **Framework & Build:** React 19, Vite
* **Styling & Layout:** Tailwind CSS v4, clsx, tailwind-merge
* **3D Graphics & Physics:** Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`), Spline (`@splinetool/react-spline`)
* **Animations:** GSAP (GreenSock Animation Platform)
* **Icons:** Lucide React

### Backend (Core Application & Admin API)
* **Framework:** Django 5.1, Django REST Framework, SimpleJWT
* **Static File Management:** WhiteNoise (`CompressedStaticFilesStorage`)
* **Form Handling & UI:** Django Crispy Forms (Bootstrap 4)
* **WSGI Production Server:** Gunicorn
* **Database:** SQLite (default / dev) / PostgreSQL (production compatible)
* **Security & Auth:** Email verification tokens, email-based 2FA, OTP Password Reset, Google reCAPTCHA

---

## Key Features

### 1. Immersive 3D Landing Page
* **Interactive 3D Drone Scene:** Custom WebGL scene built with React Three Fiber and Three.js.
* **Scroll-based GSAP Animations:** Dynamic timeline and feature reveals tracking event milestones.
* **Competition Showcase:** Detailed breakdowns for prizes, track problem statements, brochures, and sponsor tiers.
* **General Inquiry Form:** Integrated user query system with Google reCAPTCHA protection.
* **SEO Optimization:** Automated `robots.txt` and `sitemap.xml` endpoints.

### 2. User Authentication & Security
* **User Accounts:** Signup with email verification token activation.
* **Enhanced Security:** Two-Factor Authentication (2FA) via email verification links.
* **Password Recovery:** OTP (One-Time Password) reset workflow.
* **Role-Based Access:** Distinct permissions and portals for **Participants** and **Organizers (Staff)**.

### 3. Participant Portal & Team Management
* **Team Registration:** Create teams, send member invitations, and select competition tracks.
* **Payment Upload:** Direct submission of payment screenshots and transaction IDs.
* **Real-time Status:** Live verification status badges and rejection feedback handling.
* **Submission Portal:** Upload project files and assets within designated submission windows.
* **Support Ticket System:** Submit queries and track organizer responses in real time.

### 4. Organizer / Staff Administration Portal
* **Analytics Dashboard:** Real-time metrics on total participants, registered teams, verified payments, pending submissions, and open queries.
* **Payment Verification Center:** Review payment proofs, approve/reject teams with custom rejection reasons, and configure payee details and QR codes.
* **Track & Problem Statement Manager:** Dynamically update tracks, problem statement sections, and downloadable resources.
* **Submission Window & Grading Engine:** Create submission windows, set deadlines, toggle window visibility, and grade team submissions.
* **Batch Email Announcements:** Send announcements asynchronously in batches to all registered participants.
* **Test & Quiz Engine:** Build timed tests, manage questions, and review participant attempts.
* **User & Team Management:** Search and filter users/teams by college, branch, event year, or payment state, with full CSV export capabilities.

---

## Getting Started

### Prerequisites
* **Python** 3.10 or higher
* **Node.js** 18 or higher (with `npm`)

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd sim2real
```

### 2. Local Backend Setup
```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser / organizer account
python manage.py createsuperuser
```

### 3. Local Frontend Setup
```bash
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

### 4. Run Development Servers
* **Frontend (Vite):** Runs at `http://localhost:5173`
* **Backend (Django):** Run `python manage.py runserver` at `http://127.0.0.1:8000`

---

## Production Deployment

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your production credentials:
```bash
cp .env.example .env
```
Key production configurations in `.env`:
* `DEBUG=False`
* `SECRET_KEY=your_secure_random_key`
* `ALLOWED_HOSTS=sim2real.nitk.ac.in,yourdomain.com`
* `CSRF_TRUSTED_ORIGINS=https://sim2real.nitk.ac.in`
* `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` (SMTP credentials)
* `RECAPTCHA_SECRET_KEY`

### 2. Build Frontend Bundle
Compile the React application bundle into Django's static & template directories:
```bash
npm run build
```

### 3. Collect Static Assets & Run Migrations
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### 4. Start Production Server
Launch Gunicorn:
```bash
gunicorn simreal.wsgi:application --bind 0.0.0.0:8000
```

---

## Project Structure

```
Sim2Real-master-repo/
├── accounts/            # User authentication, 2FA, OTP & verification logic
├── user_profile/        # User profile models and views
├── team_profile/        # Team creation, member invites & payment submissions
├── staff_home/          # Organizer admin portal, grading, payments & announcements
├── landing_page/        # Django app serving static/React landing page & query API
├── queries/             # Support query models and context processors
├── home/                # Participant dashboard & sidebar logic
├── simreal/             # Core Django configuration, settings & root URL routing
├── src/                 # React 19 frontend source code (3D scene, components, UI)
├── public/              # Static assets for frontend
├── staticfiles/         # Collected production static assets (WhiteNoise)
├── index.html           # Main HTML template for Vite
├── vite.config.js       # Vite configuration with custom bundle move plugin
├── requirements.txt     # Python backend dependencies
└── package.json         # Node.js frontend dependencies
```

---

## License
This project is private and proprietary.
