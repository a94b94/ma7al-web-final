"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function UserDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="text-xl px-2">⋮</button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="bg-white border rounded shadow p-2 text-sm z-50"
        sideOffset={5}
      >
        <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
          الملف الشخصي
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
          تسجيل الخروج
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
