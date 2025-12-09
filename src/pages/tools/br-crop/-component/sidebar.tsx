import { Input } from "@/components/ui/input";
import { ChevronsUpDown, Download, Plus, Scissors, Sparkles, Trash, Trash2, User } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
    return (
        <div className="w-[250px] border-r flex flex-col">

            {/* Logo */}
            <div className="flex items-center gap-2 h-18 px-4 border-b border-neutral-100">
                <div className="bg-linear-to-r from-teal-200 to-yellow-200 p-2 rounded-md w-8 h-8 flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold">BR <span className="bg-linear-to-r from-teal-200 to-yellow-200 bg-clip-text">Cropp</span></span>
            </div>

            {/* Settings */}
            <div className="p-4 gap-4 flex flex-col flex-1">

                <div>
                    <Label className="uppercase text-xs">Settings</Label>
                </div>

                {/* Row */}
                <div className="flex justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs pl-1">Width</span>
                        <InputGroup className="bg-neutral-50 h-8">
                            <InputGroupInput placeholder="0" type="number" className="text-xs" />
                            <InputGroupAddon align="inline-end">px</InputGroupAddon>
                        </InputGroup>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs pl-1">Height</span>
                        <InputGroup className="bg-neutral-50 h-8">
                            <InputGroupInput placeholder="0" type="number" className="text-xs" />
                            <InputGroupAddon align="inline-end">px</InputGroupAddon>
                        </InputGroup>
                    </div>
                </div>

                {/* Row */}
                <div className="flex gap-2">
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs pl-1">Zoom Precision</span>
                        <Input className="bg-neutral-50 w-full h-8 text-xs" placeholder="0,1" defaultValue={0.1} type="number" step={0.01} min={0.1} max={1} />
                        <span className="text-muted-foreground/50 text-[0.6rem] pl-1">Lower value = finer control</span>
                    </div>
                </div>

                {/* Row */}
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs pl-1">Output Compression</span>
                        <Select>
                            <SelectTrigger className="w-full bg-neutral-50 h-8">
                                <SelectValue placeholder="Select an output quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="original">Original</SelectItem>
                                    <SelectItem value="low">Low Compression</SelectItem>
                                    <SelectItem value="medium">Medium Compression</SelectItem>
                                    <SelectItem value="high">High Compression</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground/50 text-[0.6rem] pl-1">Reduces file size without visible loss</span>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-neutral-100 w-full my-4"></div>

                {/* Row */}
                <div className="flex gap-4">

                    {/* Add Images */}
                    <Button variant={"outline"} size={"lg"} className="border border-dashed w-full bg-neutral-50 h-18">
                        <Plus className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-500">Add Images</span>
                    </Button>

                </div>

                {/* Row */}
                <div className="flex gap-4">

                    {/* Auto Smart Ajust */}
                    <Button size={"lg"} className="bg-linear-to-r from-rose-400 to-pink-400 w-full">
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Auto Smart Ajust</span>
                        <span className="text-[0.7rem] text-neutral-500 bg-white border rounded px-1 ml-2">PRO</span>
                    </Button>

                </div>

                {/* Row */}
                <div className="flex gap-4">

                    {/* Crop & Download All */}
                    <Button size={"lg"} className="w-full">
                        <Download className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Crop & Download All</span>
                    </Button>

                </div>

                {/* Row */}
                <div className="flex gap-4">

                    {/* Clear All */}
                    <Button variant={"ghost"} size={"lg"} className="w-full text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Clear All</span>
                    </Button>

                </div>

            </div>

            {/* Add user session with Dropdown here */}
            <div className="p-4 gap-4 flex flex-col">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full bg-white justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="rounded-md size-6">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <span>User Name</span>
                            </div>
                            <ChevronsUpDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>


        </div>
    )
}