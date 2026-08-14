import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "./services/supabase/supabaseClient";

const AuthContext = createContext(null);

function mapUser(user, profile = null) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name:
      profile?.name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    fullName:
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    profileType: profile?.profile_type || "general",
    alertThreshold: profile?.alert_threshold ?? 100,
  };
}

async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Error fetching profile:", err);
    return null;
  }
}

async function createProfile(user, name) {
  const fullName = String(name || "").trim();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: fullName.split(" ")[0] || "User",
        full_name: fullName || "User",
        profile_type: "general",
        alert_threshold: 100,
      })
      .select()
      .single();

    if (error) {
      console.error("Profile creation error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error creating profile:", err);
    return null;
  }
}

export async function signInUser({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password) {
    throw new Error("Please enter your password.");
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password),
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      }
      if (msg.includes("Email not confirmed")) {
        throw new Error("Your email address is not verified yet. Please check your inbox for the verification link.");
      }
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
      }
      throw new Error(msg || "Unable to sign in. Please try again later.");
    }

    const profile = await getProfile(data.user.id);
    return mapUser(data.user, profile);
  } catch (err) {
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
    }
    throw err;
  }
}

export async function registerUser({ name, email, password }) {
  const fullName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!fullName) {
    throw new Error("Please enter your full name.");
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  if (String(password || "").length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: String(password),
      options: {
        data: {
          name: fullName.split(" ")[0],
          full_name: fullName,
        },
      },
    });

    if (error) {
      const msg = error.message || "";
      if (
        msg.includes("User already registered") ||
        msg.includes("already exists") ||
        error.code === "user_already_exists"
      ) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }
      if (msg.includes("valid email") || msg.includes("invalid email")) {
        throw new Error("Please enter a valid email address.");
      }
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("network")) {
        throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
      }
      throw new Error(msg || "We couldn't send the verification email right now. Please try again later.");
    }

    if (!data || !data.user) {
      throw new Error("Something went wrong while creating your account. Please try again later.");
    }

    let profile = await getProfile(data.user.id);

    if (!profile && data.session) {
      profile = await createProfile(data.user, fullName);
    }

    return {
      user: mapUser(data.user, profile),
      session: data.session,
      needsVerification: !data.session,
      email: normalizedEmail,
    };
  } catch (err) {
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
    }
    throw err;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (mounted) {
            setCurrentUser(mapUser(session.user, profile));
          }
        } else {
          if (mounted) {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error("Auth session load error:", err);
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setCurrentUser(mapUser(session.user, profile));
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,

      signIn: async (credentials) => {
        const user = await signInUser(credentials);
        setCurrentUser(user);
        return user;
      },

      signUp: async (data) => {
        const result = await registerUser(data);

        if (result.session) {
          setCurrentUser(result.user);
        }

        return result.user;
      },

      updateCurrentUser: async (updates) => {
        if (!currentUser?.id) return;

        const nextUser =
          typeof updates === "function"
            ? updates(currentUser)
            : { ...currentUser, ...updates };

        const { data, error } = await supabase
          .from("profiles")
          .update({
            name: nextUser.name,
            full_name: nextUser.fullName,
            profile_type: nextUser.profileType,
            alert_threshold: nextUser.alertThreshold,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentUser.id)
          .select()
          .single();

        if (error) {
          console.error("Profile update error:", error);
          throw new Error(error.message);
        }

        setCurrentUser(mapUser({ id: currentUser.id, email: currentUser.email }, data));
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error("Sign out error:", error);
          throw new Error(error.message);
        }

        setCurrentUser(null);
      },
    }),
    [currentUser, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}