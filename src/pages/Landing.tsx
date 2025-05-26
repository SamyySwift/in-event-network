
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import QRCodeScanner from '@/components/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, MapPin, Lock, ArrowRight } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const Landing = () => {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanSuccess = (decodedText: string) => {
    try {
      // Example expected format: "connect://event/EVENT_ID"
      const url = new URL(decodedText);
      if (url.protocol === 'connect:') {
        const pathParts = url.pathname.split('/');
        if (pathParts.length >= 2 && pathParts[1] === 'event') {
          const eventId = pathParts[2];
          if (eventId) {
            navigate(`/join/${eventId}`);
            return;
          }
        }
      }
      
      // If we got here, something was wrong with the QR code format
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid Connect event code.",
        variant: "destructive"
      });
    } catch (error) {
      // If the QR code isn't a valid URL
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid Connect event code.",
        variant: "destructive"
      });
    }
  };

  const handleScanError = (error: string) => {
    console.error("QR Scanner error:", error);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Modern Header with Admin Access */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/logo-placeholder.svg"
              alt="Connect Logo"
              className="h-8 w-auto"
            />
            <span className="ml-2 font-semibold text-connect-800 dark:text-white text-xl">Connect</span>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-connect-600 to-connect-700 p-6 no-underline outline-none focus:shadow-md"
                            href="#"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium text-white">
                              Connect Platform
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Transform how attendees network at your events with our intelligent connection platform
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="#" title="Event Management">
                        Create and manage events with detailed schedules and attendee insights.
                      </ListItem>
                      <ListItem href="#" title="Smart Networking">
                        Connect with attendees who match your professional interests.
                      </ListItem>
                      <ListItem href="#" title="Interactive Q&A">
                        Engage speakers with real-time questions and polling.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
                      <ListItem href="#" title="Documentation">
                        Learn how to integrate Connect with your event system.
                      </ListItem>
                      <ListItem href="#" title="Case Studies">
                        See how others have used Connect for their events.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" className="px-4" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="default" className="bg-connect-600 hover:bg-connect-700" onClick={() => navigate('/register')}>
                Create Event
              </Button>
            </div>
          </div>
          <div className="flex md:hidden space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="default" size="sm" className="bg-connect-600" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Modern Design */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-connect-500/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
            <div className="mb-12 md:mb-0 relative z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-connect-600 to-connect-800 bg-clip-text text-transparent">
                A Smarter Way to Network at Events
              </h1>
              <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
                Instantly connect with like-minded people in your space. Scan a QR code, build your profile, and make meaningful connections that last.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-connect-600 hover:bg-connect-700 text-white shadow-lg shadow-connect-500/30"
                  onClick={() => setShowScanner(true)}
                >
                  Scan Event QR Code
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-connect-600 text-connect-600 hover:bg-connect-50"
                  onClick={() => navigate('/register?role=host')}
                >
                  Host an Event
                </Button>
              </div>
            </div>
            <div className="relative z-10">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 glass-effect">
                {showScanner ? (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-center">
                      Scan Event QR Code
                    </h3>
                    <QRCodeScanner 
                      onScanSuccess={handleScanSuccess} 
                      onScanError={handleScanError}
                    />
                    <Button 
                      variant="ghost" 
                      className="mt-4 w-full"
                      onClick={() => setShowScanner(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <img
                    src="https://placehold.co/600x400/connect-100/connect-600?text=Connect+App+Demo"
                    alt="Connect App Demo"
                    className="rounded-lg w-full h-auto shadow-md"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="bg-gradient-to-r from-connect-700 to-connect-800 py-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <Lock className="h-6 w-6 mr-2" />
                <h2 className="text-2xl font-bold">Event Organizer Access</h2>
              </div>
              <p className="mt-1 text-white/80">Access your event dashboard to manage attendees, schedules, and more</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-connect-800 hover:bg-gray-100 shadow-lg group"
              onClick={() => navigate('/admin')}
            >
              Admin Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Why Choose Connect?</h2>
          <p className="text-xl text-center mb-12 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Our platform is designed to maximize networking opportunities and enhance event experiences
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 hover:border-connect-200">
              <div className="w-14 h-14 bg-connect-50 dark:bg-connect-900/40 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-connect-600 dark:text-connect-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Networking</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect with attendees who match your networking goals and professional interests.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 hover:border-connect-200">
              <div className="w-14 h-14 bg-connect-50 dark:bg-connect-900/40 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-connect-600 dark:text-connect-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Event Management</h3>
              <p className="text-gray-600 dark:text-gray-400">Create and manage events with detailed schedules, speaker information, and attendee insights.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 hover:border-connect-200">
              <div className="w-14 h-14 bg-connect-50 dark:bg-connect-900/40 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-connect-600 dark:text-connect-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Navigation & Q&A</h3>
              <p className="text-gray-600 dark:text-gray-400">Easily find your way around venues and participate in interactive Q&A sessions with speakers.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to transform your event experience?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who are making meaningful connections with Connect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-connect-600 hover:bg-connect-700"
              onClick={() => navigate('/register?role=host')}
            >
              Create Your Event
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-connect-600 text-connect-600 hover:bg-connect-50 dark:border-connect-400 dark:text-connect-400 dark:hover:bg-connect-900/40"
              onClick={() => setShowScanner(true)}
            >
              Join an Event
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <img
                  src="/logo-placeholder.svg"
                  alt="Connect Logo"
                  className="h-8 w-auto"
                />
                <span className="ml-2 font-semibold text-xl">Connect</span>
              </div>
              <p className="text-gray-400">
                A new way of networking during events — instantly connect with like-minded people in your space.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Connect. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// NavigationMenu component helper
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Landing;
