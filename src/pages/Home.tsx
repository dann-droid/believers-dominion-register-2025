
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-gradient">Believers Dominion</span>
            <br />
            <span className="text-white">Conference 2025</span>
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-gray-200 animate-slide-in">
            Join us for a life-changing spiritual experience
          </p>
          
          {/* Conference Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-center space-x-3">
                <Calendar className="text-conference-gold" size={24} />
                <div>
                  <h3 className="font-bold text-lg">When</h3>
                  <p className="text-gray-200">August 11th - 16th, 2025</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="text-conference-gold" size={24} />
                <div>
                  <h3 className="font-bold text-lg">Where</h3>
                  <p className="text-gray-200">RGC Heavens Gate, Kaloleni</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/register">
            <button className="btn-conference animate-fade-in">
              Register Now
            </button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-conference-lightGrey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-conference-navy mb-4">
              Experience Divine Transformation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Believers Dominion Conference 2025 is a powerful gathering designed to strengthen faith, 
              build community, and experience God's transformative power in your life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-conference-maroon to-conference-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-conference-navy mb-2">Inspiring Worship</h3>
              <p className="text-gray-600">Experience powerful worship sessions that will lift your spirit and draw you closer to God.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-conference-maroon to-conference-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-bold text-conference-navy mb-2">Powerful Teaching</h3>
              <p className="text-gray-600">Receive life-changing biblical teaching from anointed speakers and pastors.</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-conference-maroon to-conference-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-conference-navy mb-2">Fellowship</h3>
              <p className="text-gray-600">Connect with believers from different backgrounds and build lasting relationships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-conference-navy mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We're here to help you prepare for this amazing conference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-conference-maroon rounded-full flex items-center justify-center">
                  <Phone className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-conference-navy">Phone</h3>
                  <p className="text-gray-600">+254 712 345 678</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-conference-maroon rounded-full flex items-center justify-center">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-conference-navy">Email</h3>
                  <p className="text-gray-600">info@rgcheavensgate.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-conference-maroon rounded-full flex items-center justify-center">
                  <MapPin className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-conference-navy">Address</h3>
                  <p className="text-gray-600">RGC Heavens Gate, Kaloleni, Kenya</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-2xl font-bold text-conference-navy mb-6">Follow Us</h3>
              <div className="space-y-4">
                <a href="#" className="flex items-center space-x-4 p-4 bg-conference-lightGrey rounded-lg hover:bg-gray-200 transition-colors duration-300">
                  <Facebook className="text-conference-navy" size={24} />
                  <span className="text-conference-navy font-medium">RGC Heavens Gate</span>
                </a>

                <a href="#" className="flex items-center space-x-4 p-4 bg-conference-lightGrey rounded-lg hover:bg-gray-200 transition-colors duration-300">
                  <Instagram className="text-conference-navy" size={24} />
                  <span className="text-conference-navy font-medium">@rgcheavensgate</span>
                </a>

                <a href="#" className="flex items-center space-x-4 p-4 bg-conference-lightGrey rounded-lg hover:bg-gray-200 transition-colors duration-300">
                  <Twitter className="text-conference-navy" size={24} />
                  <span className="text-conference-navy font-medium">@rgcheavensgate</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
