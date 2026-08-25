"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const LoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function Login() {
  const form = useForm({
    resolver: zodResolver(LoginSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuth((state) => state.login);
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    try {
      setIsSubmitting(true);
      const success = await login(data);

      if (success) {
        router.replace("/drive");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card className="[--card-spacing:--spacing(5)]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Login to your account
            </CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="user@example.com"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="••••••••"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Field>
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting && <Spinner />}
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/register"
                      className="underline text-primary"
                    >
                      Register
                    </Link>
                  </p>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
