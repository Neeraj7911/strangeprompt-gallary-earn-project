## StrangePrompt

StrangePrompt is a community-driven alternative to ideogram.ai that focuses on sharing user-generated image and prompt pairs. Creators upload their favorite renders, attach the exact prompts they wrote elsewhere, and earn simulated revenue through redirect-based ads that trigger on high-value actions (likes, copies, profile views, uploads).

### Features

- Responsive React + Tailwind CSS UI inspired by ideogram.ai, including category tabs, masonry-style galleries, and immersive modals.
- Firebase Authentication with email/password and Google sign-in; anonymous visitors can browse freely without login prompts.
- Firestore-backed gallery with real-time updates, infinite scrolling, per-image analytics (likes, views, copies, shares), and search by prompt keywords or tags.
- Redirect ad workflow for uploads, likes, prompt copies, and profile visits using simulated sponsor links.
- Creator dashboard with table view, analytics charts (react-chartjs-2 + Chart.js), notifications, and earnings simulation based on engagement.
- Profile pages, community feed, tagging system, reporting, sharing helpers, and global dark mode toggle.
- Modular architecture (components/pages/hooks/context/firebase) and production-friendly Firebase Hosting setup notes.

### Getting Started

1. **Install dependencies**

	```bash
	npm install
	```

2. **Configure Firebase**

	- Duplicate `.env.example` to `.env` and fill in your Firebase project credentials.
	- Enable the following Firebase products: Authentication (Email/Password + Google), Firestore, Storage.
	- Optional: configure Firebase Cloud Functions to send transactional emails or push notifications when new notifications are created.

3. **Run locally**

	```bash
	npm run dev
	```

4. **Build for production**

	```bash
	npm run build
	```

	Deploy the generated `dist/` folder to Firebase Hosting (`firebase deploy --only hosting`).

### Firebase Rules (snippet)

Add Firestore and Storage security rules that restrict writes to authenticated users and ensure creators can only modify their own uploads. Example rules are noted alongside the Firebase helper functions.

### Testing

The project is ready for Jest unit tests. Add component/unit coverage in `src/__tests__` using React Testing Library—see inline comments for suggested scenarios.

### Deployment Notes

- Update the OpenGraph meta URL in `index.html` once deployed.
- Replace placeholder redirect URLs in `src/utils/constants.js` with valid affiliate/ad-network links that support redirect-based flows.
- Ensure your Firebase Hosting headers allow cacheing for images and static assets.

### Contributing

Follow the existing lint rules (`npm run lint`) before opening a pull request. Keep styling consistent with Tailwind utility classes and the design language established in the components.
