import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Lock, Stethoscope } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: '100% Genuine Medicines',
    description: 'All products sourced directly from licensed manufacturers and distributors.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Truck,
    title: 'Express Delivery',
    description: 'Get your medicines delivered within 2-4 hours in select cities.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Lock,
    title: 'Safe & Secure Payments',
    description: 'Encrypted transactions with multiple payment options including COD.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Stethoscope,
    title: 'Free Doctor Consultation',
    description: 'Connect with certified doctors 24/7 for medical advice and prescriptions.',
    color: 'bg-orange-50 text-orange-600',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Why Choose Eviga Pharma?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your health is our priority. Here's why millions trust us.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
