import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Login() {
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
            <form className={cn("flex flex-col gap-6")}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input id="password" type="password" required />
                </Field>
                <Field>
                  <Button type="submit">Log in</Button>
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
