import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";
import { FieldSeparator } from "@/components/ui/field";
import React from "react";

export function AuthPromptDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px]" showCloseButton={false}>
        <DialogTitle>Oops, you need to log in!</DialogTitle>
        <DialogDescription>
          To upload more than 10 images, you need to log in, but don't worry, it's <span className="font-bold">free!</span>
        </DialogDescription>
        <LoginForm />
        <FieldSeparator className="my-2 text-xs">Or continue with</FieldSeparator>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="text-xs w-full">
            <img src="/icons/google.svg" className="w-4 h-4 mr-2" alt="Google" />
            Google
          </Button>
          <Button variant="outline" className="text-xs w-full">
            <img src="/icons/facebook.svg" className="w-4 h-4 mr-2" alt="Facebook" />
            Facebook
          </Button>
          <Button variant="outline" className="text-xs w-full col-span-2">
            <img src="/icons/github.svg" className="w-4 h-4 mr-2" alt="GitHub" />
            GitHub
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="mt-4 text-xs">I will send only 10 images</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
