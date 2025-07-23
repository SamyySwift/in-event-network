import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Handshake, 
  Target, 
  Award, 
  Users2, 
  Building2, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Heart,
  Globe,
  Rocket,
  Star
} from 'lucide-react';

export default function SponsorshipPartnership() {
  const navigate = useNavigate();

  const sponsorshipTiers = [
    {
      title: "Platinum Partner",
      price: "₦2,000,000+",
      features: [
        "Logo on all marketing materials",
        "Dedicated exhibition space",
        "Speaking slot opportunity",
        "VIP networking access",
        "Custom branded materials"
      ],
      color: "from-purple-600 to-purple-800",
      icon: Star
    },
    {
      title: "Gold Sponsor",
      price: "₦1,000,000+",
      features: [
        "Logo on event materials",
        "Exhibition booth space",
        "Product demonstration slot",
        "Networking opportunities",
        "Digital marketing inclusion"
      ],
      color: "from-yellow-500 to-orange-600",
      icon: Award
    },
    {
      title: "Silver Partner",
      price: "₦500,000+",
      features: [
        "Logo on select materials",
        "Shared exhibition space",
        "Networking access",
        "Social media mentions",
        "Event program listing"
      ],
      color: "from-gray-400 to-gray-600",
      icon: Building2
    }
  ];

  const partnershipTypes = [
    {
      title: "Technology Partners",
      description: "Showcase innovative tech solutions and connect with industry leaders",
      icon: Rocket,
      benefits: ["Product demos", "Tech talks", "Developer networking"]
    },
    {
      title: "Media Partners",
      description: "Amplify event reach through content collaboration and coverage",
      icon: Globe,
      benefits: ["Content collaboration", "Media coverage", "Brand visibility"]
    },
    {
      title: "Community Partners",
      description: "Foster community engagement and expand your local network",
      icon: Heart,
      benefits: ["Community access", "Local networking", "Grassroots engagement"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Handshake className="h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
              Sponsorship &<br />Partnership Hub
            </h1>
            <p className="text-xl sm:text-2xl opacity-90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join forces with leading events and expand your reach. This is your gateway to collect 
              sponsorship data from sponsors, partners, and exhibitors for your events.
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-10">
              Add our customizable forms to your flyers, posts, and marketing materials to streamline 
              sponsorship applications and partnership opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 border-2 border-white/30 backdrop-blur-sm text-white font-semibold px-8 py-4 text-lg"
                onClick={() => navigate('/scan')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/50 bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 text-lg"
                onClick={() => navigate('/login')}
              >
                View Partnership Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Partner With Us?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with engaged audiences, showcase your brand, and build meaningful relationships 
            in the event ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Targeted Reach</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Connect directly with your target audience through focused event partnerships 
                and strategic brand placement.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Network Growth</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Expand your professional network and build valuable relationships with 
                industry leaders and potential clients.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Brand Visibility</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Increase brand awareness through strategic event marketing and prominent 
                placement across all event materials.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsorship Tiers */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sponsorship Opportunities</h2>
            <p className="text-xl text-muted-foreground">
              Choose the sponsorship level that aligns with your goals and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <Card key={tier.title} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${index === 0 ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{tier.title}</CardTitle>
                    <div className="text-2xl font-bold text-primary">{tier.price}</div>
                    {index === 0 && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Most Popular
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Partnership Types */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Partnership Types</h2>
            <p className="text-xl text-muted-foreground">
              Explore different ways to collaborate and grow together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {type.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-4">Ready to Partner With Us?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Take the next step in growing your business through strategic event partnerships. 
                Join our network of successful sponsors and partners today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
                  onClick={() => navigate('/login')}
                >
                  <Handshake className="mr-2 h-5 w-5" />
                  Apply for Partnership
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                  onClick={() => navigate('/scan')}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}