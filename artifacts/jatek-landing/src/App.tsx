import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingBag, UtensilsCrossed, Sparkles, Baby, Stethoscope, Clock, MapPin, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-40 bg-brand-darker/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/jatek-logo.png" alt="Jatek" className="h-8 md:h-10 object-contain" />
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <a href="#services" className="hover:text-brand-pink transition-colors">Services</a>
        <a href="#tracking" className="hover:text-brand-teal transition-colors">Suivi Live</a>
        <a href="#pro" className="hover:text-brand-yellow transition-colors">Jatek Pro</a>
      </div>
      <a 
        href="#download" 
        className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-pink hover:text-white transition-all duration-300"
      >
        Télécharger l'app
      </a>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
    {/* Background Image & Overlay */}
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-brand-darker/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-darker via-transparent to-brand-darker/50 z-10" />
      <img 
        src="/hero-bg.jpg" 
        alt="Oujda night life" 
        className="w-full h-full object-cover object-center opacity-40 scale-105"
      />
    </div>

    {/* Abstract Glows */}
    <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-brand-pink/20 rounded-full blur-[120px] pointer-events-none z-10" />
    <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-brand-teal/20 rounded-full blur-[150px] pointer-events-none z-10" />

    <div className="max-w-7xl mx-auto px-6 relative z-20 w-full grid lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-2xl"
      >
        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-teal mb-6">
          <MapPin className="w-3.5 h-3.5" /> <span>Disponible partout à Oujda</span>
        </motion.div>
        
        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold font-display leading-[1.1] mb-6 tracking-tight text-white">
          Tout Oujda, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-yellow to-brand-teal">livré chez vous.</span>
        </motion.h1>
        
        <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/60 mb-10 max-w-lg leading-relaxed">
          Restaurants, épiceries, beauté, bébé et pharmacie. Ce dont vous avez besoin, 
          quand vous en avez besoin, livré en un clin d'œil par nos super-drivers.
        </motion.p>
        
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-6 backdrop-blur-md">
            <div className="bg-white p-2 rounded-2xl">
              <QRCodeSVG 
                value="exp://ma.jatek.app" 
                size={96} 
                level="H"
                fgColor="#050507"
                bgColor="#ffffff"
              />
            </div>
            <div className="pr-4">
              <p className="font-bold text-lg mb-1">Scanner pour <br/>télécharger</p>
              <p className="text-xs text-white/50">iOS & Android</p>
            </div>
          </div>
          <a 
            href="#download"
            className="group flex items-center gap-3 bg-brand-pink text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-pink/90 transition-all glow-pink"
          >
            Commander <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>
      
      {/* Visual App Mockup Abstract */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:block relative"
      >
        <div className="relative w-[340px] h-[680px] bg-[#0a0a0c] border-[8px] border-gray-900 rounded-[3rem] mx-auto overflow-hidden shadow-2xl z-20">
          <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-50"></div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-brand-darker to-[#111]">
            {/* Fake App UI */}
            <div className="p-6 pt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs text-white/50">Livrer à</p>
                  <p className="font-bold text-sm flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-pink"/> Hay El Qods, Oujda</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
              </div>
              
              <div className="relative mb-6">
                <input type="text" placeholder="Que cherchez-vous ?" className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 text-sm text-white outline-none" disabled/>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: UtensilsCrossed, color: 'text-brand-pink', bg: 'bg-brand-pink/10', label: 'Repas' },
                  { icon: ShoppingBag, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10', label: 'Épicerie' },
                  { icon: Sparkles, color: 'text-brand-teal', bg: 'bg-brand-teal/10', label: 'Beauté' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-medium text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-sm mb-4">Recommandé pour vous</h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-32 -left-12 bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3 z-30 shadow-xl"
        >
          <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <p className="text-xs text-white/50">Tacos de Lyon</p>
            <p className="font-bold text-sm">En route !</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const CategoryCard = ({ title, icon: Icon, image, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative h-[300px] rounded-3xl overflow-hidden cursor-pointer"
  >
    <div className="absolute inset-0 bg-brand-darker z-0" />
    <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 z-0" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
    
    <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-2`} style={{ backgroundColor: color }}>
        <Icon className="w-6 h-6 text-black" />
      </div>
      <h3 className="font-display font-bold text-2xl text-white group-hover:text-transparent group-hover:bg-clip-text transition-all" style={{ backgroundImage: `linear-gradient(to right, ${color}, white)` }}>{title}</h3>
    </div>
  </motion.div>
);

const Verticals = () => (
  <section id="services" className="py-32 px-6 relative border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">La ville entière dans<br/>votre poche.</h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">Vos envies n'attendent pas. Jatek non plus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryCard title="Restaurants" icon={UtensilsCrossed} image="/category-food.jpg" color="var(--color-brand-pink)" delay={0.1} />
        <CategoryCard title="Épicerie" icon={ShoppingBag} image="/category-grocery.jpg" color="var(--color-brand-yellow)" delay={0.2} />
        <CategoryCard title="Beauté & Soins" icon={Sparkles} image="/category-beauty.jpg" color="var(--color-brand-teal)" delay={0.3} />
        <CategoryCard title="Bébé" icon={Baby} image="/category-baby.jpg" color="#FF8A65" delay={0.4} />
        <CategoryCard title="Pharmacie" icon={Stethoscope} image="/category-health.jpg" color="#4DB6AC" delay={0.5} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-brand-pink/10 border border-brand-pink/20 rounded-3xl p-8 flex flex-col justify-center items-center text-center group hover:bg-brand-pink/20 transition-colors"
        >
          <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mb-4 glow-pink">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl mb-2 text-brand-pink">Livraison Flash</h3>
          <p className="text-white/60 text-sm">Des coursiers dédiés pour une rapidité fulgurante à travers Oujda.</p>
        </motion.div>
      </div>
    </div>
  </section>
);

const TrackingInfo = () => (
  <section id="tracking" className="py-32 px-6 bg-[#050507] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-teal/5 rounded-full blur-[100px] pointer-events-none" />
    
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <div className="order-2 lg:order-1 relative rounded-[2.5rem] overflow-hidden aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
        <img src="/delivery-driver.jpg" alt="Jatek Driver" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
        
        {/* Mock Live Tracking UI */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center border-2 border-white">
              <span className="font-bold text-black">A</span>
            </div>
            <div>
              <p className="font-bold text-white">Amine est en route</p>
              <p className="text-sm text-brand-teal font-medium">Arrive dans 8 min</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-teal"
              initial={{ width: "30%" }}
              animate={{ width: "70%" }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
      
      <div className="order-1 lg:order-2">
        <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Ne perdez plus<br/>jamais le nord.</h2>
        <p className="text-lg text-white/60 mb-10 leading-relaxed">
          Suivez votre commande en temps réel depuis la cuisine du restaurant jusqu'à votre porte. Nos chauffeurs sont équipés d'un GPS ultra-précis pour que vous sachiez exactement quand dresser la table.
        </p>
        
        <ul className="space-y-6">
          {[
            { icon: Clock, title: "Estimations fiables", desc: "Temps de préparation et de trajet calculés par notre algorithme." },
            { icon: MapPin, title: "Position GPS en direct", desc: "Regardez votre livreur slalomer (prudemment) dans les rues d'Oujda." },
            { icon: ShieldCheck, title: "Contact direct", desc: "Appelez ou envoyez un message à votre livreur en un clic." }
          ].map((feature, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-brand-yellow" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{feature.title}</h4>
                <p className="text-sm text-white/50 mt-1">{feature.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

const ProTier = () => (
  <section id="pro" className="py-32 px-6 border-y border-white/5">
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-brand-yellow/10 to-transparent border border-brand-yellow/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center gap-12">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-yellow/20 rounded-full blur-[80px]" />
      
      <div className="flex-1 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow/20 text-brand-yellow text-xs font-bold uppercase tracking-wider mb-6">
          <Star className="w-4 h-4 fill-brand-yellow" /> Nouveau
        </div>
        <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">Jatek <span className="text-brand-yellow">Pro</span></h2>
        <p className="text-white/70 text-lg mb-8 max-w-md mx-auto md:mx-0">
          Rejoignez le club. Livraison gratuite illimitée, offres exclusives chez nos partenaires, et service client prioritaire.
        </p>
        <button className="bg-brand-yellow text-black px-8 py-4 rounded-full font-bold hover:bg-white transition-colors duration-300">
          Découvrir l'abonnement
        </button>
      </div>
      
      <div className="relative z-10 w-64 h-64 flex-shrink-0">
        <div className="absolute inset-0 bg-brand-yellow rounded-full blur-[40px] opacity-20" />
        <div className="relative w-full h-full bg-gradient-to-tr from-[#1a1500] to-[#332b00] border-2 border-brand-yellow/50 rounded-full flex items-center justify-center shadow-2xl">
          <img src="/jatek-logo.png" alt="Jatek" className="w-32 opacity-80 mix-blend-screen" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-4xl font-display font-black text-brand-yellow/10 tracking-widest uppercase rotate-45 transform pointer-events-none">PRO PRO</div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#050507] pt-20 pb-10 px-6 relative border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <img src="/jatek-logo.png" alt="Jatek" className="h-8 mb-6 grayscale hover:grayscale-0 transition-all" />
          <p className="text-white/50 text-sm max-w-sm mb-6">
            La première super-app de livraison pensée, créée et déployée à Oujda, pour les Oujdis. 
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-pink transition-colors text-white/70 hover:text-white">IG</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-teal transition-colors text-white/70 hover:text-white">FB</a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors text-white/70">TW</a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">L'entreprise</h4>
          <ul className="space-y-3 text-sm text-white/50">
            <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Partenaires</h4>
          <ul className="space-y-3 text-sm text-white/50">
            <li><a href="#" className="hover:text-brand-pink transition-colors">Devenir Partenaire</a></li>
            <li><a href="#" className="hover:text-brand-teal transition-colors">Devenir Livreur</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Solutions Pro</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>&copy; {new Date().getFullYear()} Jatek App. Fièrement créé à Oujda, Maroc.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">CGU</a>
          <a href="#" className="hover:text-white">Confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-brand-darker text-white selection:bg-brand-pink selection:text-white">
      <div className="bg-noise" />
      <Navbar />
      <main>
        <Hero />
        <Verticals />
        <TrackingInfo />
        <ProTier />
      </main>
      <Footer />
    </div>
  );
}
