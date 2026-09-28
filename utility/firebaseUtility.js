import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create initial Firestore user document for a new anonymous user
// Existing documents are left unchanged
async function ensureUserDocument(uid) {
    const userRef = doc(db, 'users', uid);
    const existingUser = await getDoc(userRef);

    if (!existingUser.exists()) {
        await setDoc(userRef, {
            createdAt: serverTimestamp(),
            lastActiveAt: serverTimestamp()
        })
    }
};

export function initFirebaseUser() {

    // Listen for changes to Firebase authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {

            // Ensure every authenticated anonymous user has a corresponding document in the Firestore users collection
            await ensureUserDocument(user.uid);
            console.log('Firebase User Ready:', user.uid);

        } else {

            // Create an anonymous Firebase identity when no authenticated user exists
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error('Anonymous sign-in failed:', error);
            }
        }
    });
}