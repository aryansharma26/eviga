import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    initial: 'P',
    time: '2 weeks ago',
    rating: 5,
    text: "I've been ordering my father's diabetes medicines from Eviga Pharma for 6 months now. The prices are better than my local pharmacy and delivery is always on time. The prescription upload feature is so convenient!",
  },
  {
    id: 2,
    name: 'Rahul Verma',
    initial: 'R',
    time: '1 month ago',
    rating: 5,
    text: "As a working professional, I never have time to visit a pharmacy. Eviga Pharma has been a lifesaver! The app is easy to use, medicines are genuine, and their customer support is excellent.",
  },
  {
    id: 3,
    name: 'Ananya Gupta',
    initial: 'A',
    time: '3 weeks ago',
    rating: 5,
    text: "Great selection of Ayurvedic products. I found brands here that aren't available in local stores. The packaging is always secure and the expiry dates are well within range. Highly recommended!",
  },
  {
    id: 4,
    name: 'Suresh Patel',
    initial: 'S',
    time: '5 days ago',
    rating: 4,
    text: "The health tips and articles on the platform have helped me make better lifestyle choices. I also appreciate the doctor consultation feature which saved me multiple trips to the clinic.",
  },
  {
    id: 5,
    name: 'Meera Krishnan',
    initial: 'M',
    time: '1 week ago',
    rating: 5,
    text: "Ordered baby care products for my newborn. Everything arrived in perfect condition with good expiry dates. The subscription feature for monthly diaper delivery is a game changer for new parents!",
  },
];

const Testimonials = () => {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Real stories from real people who trust us with their health
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-brand/20 mb-4" />
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{testimonial.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                    <span className="text-brand font-bold text-sm">{testimonial.initial}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Second row - 2 cards centered on large screens */}
        <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
          {testimonials.slice(3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-brand/20 mb-4" />
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{testimonial.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                    <span className="text-brand font-bold text-sm">{testimonial.initial}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
