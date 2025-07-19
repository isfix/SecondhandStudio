import { useState, useEffect, createContext, useContext } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserByFirebaseUid, createUser } from "@/lib/firestore";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: (User & { id: string }) | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { id: string }) | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          let dbUser = await getUserByFirebaseUid(firebaseUser.uid);
          
          if (!dbUser) {
            // Create new user in Firestore
            const userId = await createUser({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              phoneNumber: firebaseUser.phoneNumber || "",
            });
            
            dbUser = await getUserByFirebaseUid(firebaseUser.uid);
          }
          
          setUser(dbUser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
