import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
    return (
        <div className="flex items-center h-14 px-4 w-full">
            <span className="text-lg text-neutral-600 font-bold w-full">{title}</span>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger className="px-3 py-2 border rounded-md text-sm">Menu</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Cobrança</DropdownMenuItem>
                        <DropdownMenuItem>Equipe</DropdownMenuItem>
                        <DropdownMenuItem>Assinatura</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="text-sm" onClick={() => {}}>Entrar</Button>
            </div>
        </div>
    )
}
