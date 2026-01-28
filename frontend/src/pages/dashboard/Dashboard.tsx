import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';

const features = [
  {
    title: 'Upload Documents',
    description: 'Upload and manage your legal contracts for AI-powered analysis.',
    icon: FileText,
    href: '/dashboard/documents',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    title: 'Risk Analysis',
    description: 'Identify and classify risks in your contracts clause by clause.',
    icon: AlertTriangle,
    href: '/dashboard/risk-analysis',
    color: 'text-amber-600 bg-amber-100',
  },
  {
    title: 'Layman Explanation',
    description: 'Get plain-language summaries of complex legal terms.',
    icon: BookOpen,
    href: '/dashboard/layman-summary',
    color: 'text-green-600 bg-green-100',
  },
  {
    title: 'AI Chatbot',
    description: 'Ask questions about your contracts and get cited answers.',
    icon: MessageSquare,
    href: '/dashboard/chatbot',
    color: 'text-purple-600 bg-purple-100',
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your contracts and get AI-powered legal insights.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className="group hover:shadow-card-hover transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Link to={feature.href}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to analyze your first contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Upload a contract</p>
                <p className="text-sm text-muted-foreground">
                  Go to Documents and upload a PDF contract for analysis.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Run risk analysis</p>
                <p className="text-sm text-muted-foreground">
                  Click "Analyze Risk" to identify potential issues in your contract.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">Get explanations</p>
                <p className="text-sm text-muted-foreground">
                  Generate layman summaries or chat with our AI assistant for detailed insights.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
