import React from 'react';
import { Button } from '@/shared/ui/button';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 w-full bg-white px-6 py-4 flex justify-between items-center z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-full" />
        <span className="text-xl font-black">InvoiceGuard</span>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm font-semibold hover:underline cursor-pointer">Help</span>
        <Button variant="outline" className="text-sm py-2 px-4">Log in</Button>
        <Button className="text-sm py-2 px-4">Register</Button>
      </div>
    </nav>
  );
};
