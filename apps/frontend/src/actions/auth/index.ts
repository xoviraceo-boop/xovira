'use server'

import axios from "axios";
import { signIn, signOut } from '@/lib/auth';
import { redirect } from "next/navigation";
import { AuthError } from 'next-auth';
import { API_ENDPOINTS } from '@/constants/api';
import { getServerSideURL } from '@/utils/utilities/getURL';

export async function SignInWithGoogle() {
  try {
    await signIn('google');
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw error;
  }
}

export async function SignInWithCredentials(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw error;
  }
}

export async function SignInWithMagicLink(email: string) {
  try {
    await signIn('nodemailer', { email, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export async function RegisterUser(email: string, password: string) {
  try {
    const res = await axios.post(
      `${getServerSideURL()}${API_ENDPOINTS.auth.register}`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (res.data.success) {
      return { success: true, message: "Registration successful" };
    } else {
      throw new Error(res.data.message || "Registration failed");
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Registration failed");
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message || "Unexpected error");
    }
  }
}

export async function SignOut() {
  try {
    await signOut({ redirectTo: "/login" });
  } catch (error) {
    throw error;
  }
}

export async function completeOnboarding() {
  redirect("/home");
}

export async function RequestPasswordReset(email: string) {
  try {
    const res = await axios.post(
      `${getServerSideURL()}${API_ENDPOINTS.auth.reset.request}`,
      { email },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return res.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to request reset')
    }
    throw new Error(error.message || 'Unexpected error')
  }
}

export async function ConfirmPasswordReset(token: string, newPassword: string) {
  try {
    const res = await axios.post(
      `${getServerSideURL()}${API_ENDPOINTS.auth.reset.confirm}`,
      { token, newPassword },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return res.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to reset password')
    }
    throw new Error(error.message || 'Unexpected error')
  }
}