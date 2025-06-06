
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  Star, 
  ArrowRight,
  Key,
  Smartphone,
  Globe,
  Zap
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Key,
      title: "Easy Access",
      description: "Join events instantly with a simple 6-digit key"
    },
    {
      icon: Users,
      title: "Smart Networking",
      description: "Connect with like-minded professionals and expand your network"
    },
    {
      icon: Calendar,
      title: "Live Schedule",
      description: "Stay updated with real-time event schedules and notifications"
    },
    {
      icon: MessageSquare,
      title: "Interactive Q&A",
      description: "Ask questions and participate in live discussions"
    },
    {
      icon: MapPin,
      title: "Event Navigation",
      description: "Find your way around with interactive maps and facility info"
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description: "Optimized for mobile devices for seamless on-the-go access"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-connect-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Connect</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Experience Events Like
            <span className="text-connect-600"> Never Before</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect brings attendees together with real-time networking, interactive features, 
            and seamless event management. Join the future of event experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => navigate('/join')} className="text-lg px-8 py-3">
              <Key className="h-5 w-5 mr-2" />
              Join Event
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/register')} className="text-lg px-8 py-3">
              Create Account
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Have a 6-digit event key? Click "Join Event" to get started instantly!
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Amazing Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From networking to navigation, Connect provides all the tools for memorable event experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-connect-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-connect-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-connect-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Connect?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who are already networking smarter and experiencing events better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/join')} className="text-lg px-8 py-3">
              <Key className="h-5 w-5 mr-2" />
              Join with Event Key
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/register')} className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-connect-600">
              Sign Up Free
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-connect-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Connect</span>
              </div>
              <p className="text-gray-400 max-w-md">
                The next generation event platform that brings people together through meaningful connections and engaging experiences.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/join" className="hover:text-white transition-colors">Join Event</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Networking</li>
                <li>Event Schedule</li>
                <li>Interactive Q&A</li>
                <li>Real-time Updates</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
