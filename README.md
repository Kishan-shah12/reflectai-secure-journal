# ReflectAI — Secure AI-Powered Journaling Platform

ReflectAI is a secure, full-stack reflective journaling web application powered by **Gemini 3.6 Flash** and **Firebase / Google Cloud**. It provides authenticated users with private, AI-assisted reflections, sentiment insights, and multi-turn conversations, isolated strictly to each user's authenticated UID.

---

## 1. Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons, Motion animations.
- **Backend**: Node.js Express server running on port 3000 with `@google/genai` SDK and Firebase Admin JWT verification.
- **AI Model**: `gemini-3.6-flash` (sole AI engine with bounded exponential backoff retries on transient errors).
- **Database & Auth**: Google Firebase Authentication (Federated Google Sign-In) and Cloud Firestore with strict per-user security rules (`/users/{userId}/journals/{journalId}`).

---

## 2. Prerequisites & Cloud APIs

Ensure the Google Cloud CLI (`gcloud`) and Firebase CLI are installed and authenticated:

```bash
# Login to Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

---

## 3. Secret Management Setup

ReflectAI retrieves the Gemini API key securely from server-side environment variables or Google Cloud Secret Manager.

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Firestore Database & Security Rules

ReflectAI enforces strict owner-bound data isolation. All user notes, sessions, and interactions are stored under `/users/{userId}`.

### `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile data isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User journal sessions isolation
      match /journals/{journalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Multi-turn messages isolation
        match /messages/{messageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }

      // Interaction records isolation
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Default deny for all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Deploy the rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 5. Local Development

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```
4. Start the full-stack server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

---

## 6. Cloud Run Deployment Flow

Build and deploy the containerized application to Google Cloud Run:

```bash
# Build & Deploy to Cloud Run
gcloud run deploy reflectai-app \
  --source . \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

---

## 7. Challenge & Campaign Verification Binding

Apply the mandatory verification label to register your Cloud Run service for automated challenge verification:

```bash
# Apply verification label
gcloud run services update reflectai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-east1
```

---

## 8. Security & Threat Modeling Summary

| Threat Zone | Risk | Implemented Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Prompt injection & payload bloat | Zod schema validation (`message: 1–4000 chars`), system instruction delimiters, UI counters |
| **Planning & Reasoning** | Persona drift & instruction bypass | Strict server-side system instructions anchoring Gemini to supportive reflection |
| **Tool Execution** | Unauthenticated API abuse | JWT verification via Firebase Admin, Express in-memory IP rate limiting |
| **Memory & State** | Cross-user data leakage | Strict Firestore security rules bound to `users/{uid}`, canonical UID backend binding |
| **Inter-System** | API key leakage | Zero client-side API keys (`GEMINI_API_KEY` stored strictly server-side) |
