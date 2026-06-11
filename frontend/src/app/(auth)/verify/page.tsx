"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-email", { otp });
      toast.success(data.message);

      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl");

      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/onboarding");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      const { data } = await api.post("/auth/resend-otp");
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Account</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email to verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResend}>
            Resend OTP
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
