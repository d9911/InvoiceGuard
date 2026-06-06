import React from 'react';
import { Navbar } from '@/widgets/navbar/ui';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="px-6 py-20 bg-canvas-soft flex flex-col md:flex-row items-center justify-between gap-12 max-w-[1200px] mx-auto">
        <div className="md:w-1/2">
          <h1 className="text-7xl md:text-[96px] leading-[0.9] mb-8">
            The world's money at your fingertips.
          </h1>
          <p className="text-xl text-body mb-8 max-w-md">
            The cheap, fast way to send money abroad. Join over 16 million people and businesses.
          </p>
        </div>

        <div className="md:w-1/2 w-full max-w-[480px]">
          <Card className="shadow-2xl border-2 border-ink">
            <div className="space-y-6">
              <h3 className="text-2xl">Create an invoice</h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold">You send</label>
                <div className="flex gap-2 p-4 bg-canvas-soft rounded-xl border border-ink/10">
                  <input type="number" defaultValue={1000} className="bg-transparent text-2xl font-bold w-full outline-none" />
                  <span className="font-bold text-xl">GBP</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Recipient gets</label>
                <div className="flex gap-2 p-4 bg-canvas-soft rounded-xl border border-ink/10">
                  <input type="number" defaultValue={1165.2} readOnly className="bg-transparent text-2xl font-bold w-full outline-none text-mute" />
                  <span className="font-bold text-xl text-mute">EUR</span>
                </div>
              </div>
              <Button className="w-full text-lg py-4">Get started</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-20 bg-white grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
        <Card className="bg-canvas-soft">
          <h4 className="text-xl font-bold mb-2">Safe & Secure</h4>
          <p className="text-sm text-body">Verified by HMAC signatures and 2FA protection for every transaction.</p>
        </Card>
        <Card className="bg-primary-pale">
          <h4 className="text-xl font-bold mb-2">Real-time stats</h4>
          <p className="text-sm text-body">Integrated with Prometheus and Grafana for professional monitoring.</p>
        </Card>
        <Card className="bg-ink text-primary">
          <h4 className="text-xl font-bold mb-2">Modern API</h4>
          <p className="text-sm text-primary/80">Built with Clean Architecture and DDD principles for maximum reliability.</p>
        </Card>
      </section>
    </main>
  );
}
