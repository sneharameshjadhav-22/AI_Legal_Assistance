import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileSearch, Shield, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Contract Upload & Analysis',
    description: 'Upload PDF contracts and get instant AI-powered analysis of all clauses and terms.',
  },
  {
    icon: Shield,
    title: 'Risk Classification',
    description: 'Automatically identify and classify risk levels for each clause in your contracts.',
  },
  {
    icon: BookOpen,
    title: 'Layman Explanations',
    description: 'Get plain-language summaries that make complex legal terms easy to understand.',
  },
  {
    icon: MessageSquare,
    title: 'Explainable AI Chatbot',
    description: 'Ask questions about your contracts and get answers with cited clause references.',
  },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 animate-fade-in">
            AI Legal Assistance
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
            AI-powered contract analysis for legal and compliance teams. Understand your contracts faster with intelligent risk assessment and plain-language explanations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild size="lg" className="text-base">
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our platform helps legal and compliance teams analyze contracts efficiently using advanced AI technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to streamline your contract review?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join legal teams that use AI Legal Assistance to review contracts faster and more accurately.
          </p>
          <Button asChild size="lg">
            <Link to="/register">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 AI Legal Assistance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
