// import { Card } from '@/app/ui/dashboard/cards'; // MOVING TO SUSPENSE
import RevenueChart from '@/app/ui/dashboard/revenue-chart'; // MOVING TO SUSPENSE
import LatestInvoices from '@/app/ui/dashboard/latest-invoices'; // MOVING TO SUSPENSE
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data'; // REMOVED fetchRevenue fetchLatestInvoices to SUSPENSE
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons'; // WRAP THIS IN SUSPENSE NOW
import { LatestInvoicesSkeleton, CardSkeleton } from '@/app/ui/skeletons'; // WRAP THESE IN SUSPENSE NOW
import CardWrapper from '@/app/ui/dashboard/cards'; // CARDS TO SUSPENSE NOW

export default async function Page() {
  // const revenue = await fetchRevenue(); MOVED TO SUSPENSE
  // const latestInvoices = await fetchLatestInvoices(); MOVED TO SUSPENSE 
  // MOVING CARDS TO SUSPENSE
  // const {
  //   numberOfInvoices,
  //   numberOfCustomers,
  //   totalPaidInvoices,
  //   totalPendingInvoices
  // } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* MOVING CARDS TO SUSPENSE
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />  */}
        <Suspense fallback={<CardSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense> 
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}