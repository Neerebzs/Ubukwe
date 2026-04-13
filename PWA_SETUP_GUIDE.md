# PWA Setup Guide for Ubukwe 📱

Your Ubukwe wedding platform is now a **Progressive Web App (PWA)**! Users can install it on their phones and computers like a native app.

## ✅ What's Been Set Up

### 1. **manifest.json** (`/public/manifest.json`)
- App name, description, and branding
- Theme color: `#6b856c` (your brand green)
- Display mode: `standalone` (full-screen app experience)
- Icons configuration for 192x192 and 512x512

### 2. **service-worker.js** (`/public/service-worker.js`)
- Enables offline functionality
- Caches essential pages and assets
- Provides faster load times on repeat visits

### 3. **PWA Installer Component** (`/components/pwa-installer.tsx`)
- Shows install prompt to users
- Registers service worker automatically
- Provides "Install App" button when available

### 4. **Updated Layout** (`/app/layout.tsx`)
- Added manifest link
- Added theme color meta tags
- Added Apple touch icon support
- Integrated PWA installer component

## 🎨 Create App Icons (Required)

You need to create two icon sizes from your logo:

1. **icon-192.png** (192x192 pixels)
2. **icon-512.png** (512x512 pixels)

### Quick Icon Creation:

**Option 1: Use Online Tool**
- Go to https://realfavicongenerator.net/
- Upload your `logo.png` or `logo3.png`
- Download the generated icons
- Rename them to `icon-192.png` and `icon-512.png`
- Place in `/public/` folder

**Option 2: Use Image Editor**
```bash
# If you have ImageMagick installed:
convert public/logo.png -resize 192x192 public/icon-192.png
convert public/logo.png -resize 512x512 public/icon-512.png
```

**Option 3: Manual Resize**
- Open `logo.png` in any image editor (Photoshop, GIMP, Paint.NET)
- Resize to 192x192, save as `icon-192.png`
- Resize to 512x512, save as `icon-512.png`
- Place both in `/public/` folder

## 🚀 How It Works

### For Users:

**On Mobile (Android/iOS):**
1. Visit your website in Chrome/Safari
2. Browser shows native "Add to Home Screen" or "Install" prompt
3. Tap "Install" or "Add"
4. App icon appears on home screen
5. Opens like a native app (no browser UI)

**On Desktop (Chrome/Edge):**
1. Visit your website
2. Look for install icon (⊕) in address bar
3. Click "Install Ubukwe"
4. App opens in its own window

**Alternative Install Methods:**
- **Chrome Mobile**: Menu (⋮) → "Install app" or "Add to Home screen"
- **Safari iOS**: Share button → "Add to Home Screen"
- **Chrome Desktop**: Menu (⋮) → "Install Ubukwe..."
- **Edge Desktop**: Settings (⋯) → "Apps" → "Install Ubukwe"

### Features Users Get:
- ✅ Home screen icon
- ✅ Full-screen experience (no browser bars)
- ✅ Faster loading (cached assets)
- ✅ Works offline (basic functionality)
- ✅ Push notifications (can be added later)
- ✅ Native app feel

## 🔒 HTTPS Requirement

**IMPORTANT:** PWAs only work on HTTPS (secure connections).

- ✅ Works on `localhost` (for development)
- ✅ Works on `https://yourdomain.com` (production)
- ❌ Does NOT work on `http://yourdomain.com` (insecure)

Make sure your hosting provider supports HTTPS (most do by default):
- Vercel ✅
- Netlify ✅
- AWS Amplify ✅
- Heroku ✅

## 🧪 Testing

### Test Locally:
```bash
cd Ubukwe
npm run dev
```

Visit `http://localhost:3000` and check:
1. Console shows "Service Worker registered"
2. DevTools > Application > Manifest shows your app info
3. DevTools > Application > Service Workers shows active worker

### Test Install Prompt:
1. Open Chrome DevTools
2. Go to Application > Manifest
3. Click "Add to home screen" to test install

### Test on Real Device:
1. Deploy to production (HTTPS required)
2. Visit on your phone
3. Look for install prompt or browser menu "Install app"

## 📝 Customization

### Change Theme Color:
Edit `manifest.json` and `layout.tsx`:
```json
"theme_color": "#6b856c"  // Your brand color
```

### Add More Cached Pages:
Edit `service-worker.js`:
```javascript
const urlsToCache = [
  '/',
  '/services',
  '/about',
  '/events',  // Add more pages
];
```

### Customize Install Prompt:
Edit `components/pwa-installer.tsx` to change the UI/text.

## 🎯 Next Steps

1. **Create the icons** (icon-192.png and icon-512.png)
2. **Deploy to production** with HTTPS
3. **Test on mobile device**
4. **Share with users!**

## 📱 User Benefits

Your users can now:
- Install Ubukwe like WhatsApp or Instagram
- Access it from their home screen
- Use it without opening a browser
- Get faster load times
- Use basic features offline

## 🐛 Troubleshooting

**Install prompt not showing?**
- Ensure HTTPS is enabled
- Check icons exist (192 and 512)
- Clear browser cache and reload
- Check DevTools console for errors

**Service worker not registering?**
- Check browser console for errors
- Ensure `service-worker.js` is in `/public/`
- Try unregistering old workers in DevTools

**Icons not showing?**
- Verify icon files exist in `/public/`
- Check file names match manifest.json
- Clear cache and reinstall

## 🎉 Success!

Once deployed with HTTPS and icons, your Ubukwe platform will be installable on any device! Users get a native app experience without app store approval or downloads.
