import { Link } from 'react-router-dom';
import { Video, Zap, Users, Wifi, MessageSquare, Image, ArrowRight, Brain, Eye, Building, Code, Radio } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'AI Video Responses',
    description: 'AI replies using short talking-avatar videos.'
  },
  {
    icon: Zap,
    title: 'Fake-Live Video Experience',
    description: 'Asynchronous responses designed to feel live.'
  },
  {
    icon: Users,
    title: 'Avatar Personality Control',
    description: 'Choose how the AI speaks and explains.'
  },
  {
    icon: Wifi,
    title: 'Low Bandwidth Friendly',
    description: 'No real-time video required.'
  },
  {
    icon: MessageSquare,
    title: 'Session-Based Conversations',
    description: 'Context is remembered per conversation.'
  },
  {
    icon: Image,
    title: 'Optional Image Avatar',
    description: 'Upload an image to personalize the avatar.'
  }
];

const steps = [
  { number: 1, text: 'You ask a question' },
  { number: 2, text: 'AI processes it' },
  { number: 3, text: 'AI generates a video reply' },
  { number: 4, text: 'You watch and respond' }
];

const futureEnhancements = [
  { icon: Brain, title: 'Multi-LLM Support' },
  { icon: Eye, title: 'Vision-Based AI' },
  { icon: Building, title: 'Industry-Specific Avatars' },
  { icon: Code, title: 'Developer API & SDK' },
  { icon: Radio, title: 'Real-Time Interaction (Research)' }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-slide-in">
            <div className="relative">
              <Video className="w-8 h-8 text-white animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Video className="w-8 h-8 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 text-gradient">
              Persona Video AI
            </span>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 text-sm font-medium glass-effect hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 ripple"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 text-gradient">
              AI That Talks Back — Visually
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Persona Video AI lets you chat with an AI that responds using talking video messages — without live streaming.
          </p>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Instead of plain text replies, Persona Video AI delivers short AI-generated video responses that feel like a real conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Link
              to="/login"
              className="group px-8 py-4 bg-white text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 ripple relative overflow-hidden"
            >
              <span className="relative z-10">Try the Demo</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 glass-effect border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 ripple"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </section>

      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-400 text-gradient">
            What You Can Do Today
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto text-lg">
            Experience the future of AI conversations with video responses
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-white/10 glass-effect hover:bg-white/10 transition-all duration-500 hover-lift card-3d animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="relative mb-4">
                  <feature.icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl"></div>
      </section>

      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 text-gradient">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center relative animate-slide-up" style={{animationDelay: `${index * 0.15}s`}}>
                <div className="group w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white to-gray-300 text-black flex items-center justify-center text-2xl font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-110 card-3d">
                  <span className="relative z-10">{step.number}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p className="text-lg text-gray-300 font-medium">{step.text}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block w-6 h-6 text-gray-600 absolute right-0 top-10 transform translate-x-1/2 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </section>

      <section className="relative py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white to-gray-400 text-gradient">
            Future Enhancements
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Coming soon to Persona Video AI
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {futureEnhancements.map((item, index) => (
              <div
                key={item.title}
                className="group px-6 py-4 rounded-xl border border-white/10 glass-effect hover:bg-white/10 flex items-center gap-3 cursor-default transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="text-gray-400 group-hover:text-white transition-colors">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative py-16 px-6 border-t border-white/10 glass-dark">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Video className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 text-gradient">
              Persona Video AI
            </span>
          </div>
          <p className="text-gray-400 mb-3 text-lg">
            Persona Video AI — Async AI video conversations.
          </p>
          <p className="text-gray-500 text-sm">
            This demo does not provide live video calls.
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </footer>
    </div>
  );
}
