'use client';

import Image from 'next/image';
import Link from 'next/link';
import AnimatedSection from './AnimatedSection';

export default function WhoWeAreSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <AnimatedSection className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">
              Who We Are
            </h2>
            <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
              <p>
                <strong>FITAURA</strong> is a modern lifestyle clothing brand offering gymwear, athleisure and fashion-forward apparel — designed to empower confidence and comfort.
              </p>
              <p>
                Built in Calgary, shipping worldwide. Our roots are in performance, but our vision is bigger: a full wardrobe for every part of your day.
              </p>
              <div className="pt-4">
                <Link 
                  href="/about" 
                  className="inline-flex items-center text-sienna-600 font-medium hover:text-ink-900 transition-colors group"
                >
                  <span className="border-b border-transparent group-hover:border-ink-900 transition-colors">Read Our Full Story</span>
                  <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1"></i>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Image Content */}
          <AnimatedSection className="order-1 lg:order-2 relative" delay={200}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative group bg-white">
              <Image
                src="/brand/about-hero.jpg"
                alt="FITAURA — About us"
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Decorative Overlay */}
              <div className="absolute inset-0 bg-ink-900/10 group-hover:bg-transparent transition-colors duration-300"></div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
