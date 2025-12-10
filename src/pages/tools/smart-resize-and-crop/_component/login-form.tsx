import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export function LoginForm() {
  return (
    <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Email</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Password</Label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <Button className="bg-neutral-800 text-white text-xs">
        <LogIn /> Login
      </Button>
      <a href="/register" className="text-xs w-full block text-center my-2 underline">
        I don't have an account
      </a>
    </form>
  );
}

