import Layout from "@/components/layout";
import SubscriptionManager from "@/components/subscription-manager";

export default function SubscriptionPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose the plan that best fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        <SubscriptionManager />
      </div>
    </Layout>
  );
}