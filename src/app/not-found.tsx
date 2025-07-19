
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 text-center p-8 shadow-none border-none">
        <CardHeader>
          <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg pt-2 text-muted-foreground">
            Sorry, the page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="default" className="mt-6">
            <Link href="/">
              Go back to Homepage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
